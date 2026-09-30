import Image from 'next/image'
import { amount } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { STATES } from '@/lib/states'
import { numberToWords, rupeesInWords } from '@/lib/words'
import { KINDS, type Kind } from '@/lib/documents'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'

// The printed page itself. One component for the saved document, the share link and the live preview,
// so what she sees while typing is exactly what prints.
// Layout switches on the page's own width (container queries), not the screen's, so a shrunken preview keeps the full letterhead layout.
type Num = number | string
export type Bank = { bank_name: string | null; bank_account: string | null; bank_ifsc: string | null; upi_id: string | null }
export type PaperParty = { name: string; address: string | null; gstin: string | null; phone: string | null; state_code: string } & Partial<Bank>
export type PaperItem = { id: string; description: string; hsn: string | null; unit: string | null; qty: Num; rate: Num; gst_rate: Num; amount: Num; tax: Num; batch: string | null }
export type PaperDoc = {
  kind: Kind; number: string; date: string; valid_until: string | null; due_date: string | null; reference: string | null
  eway_bill: string | null; packages: number | null; gst_type: 'cgst_sgst' | 'igst'
  subtotal: Num; cgst: Num; sgst: Num; igst: Num; total: Num; notes: string | null; cancelled_at: string | null; cancel_reason: string | null
}
export type CopyKind = 'original' | 'duplicate' | 'triplicate'
const COPY_LABEL: Record<CopyKind, string> = { original: 'Original for recipient', duplicate: 'Duplicate for transporter', triplicate: 'Triplicate for supplier' }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const date = (iso: string | null) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? formatDate(iso.slice(0, 10)) : '–')

// Layout follows the Kleven Care letterhead and templates. Invoice fields per CGST Rule 46: https://cbic-gst.gov.in/cgst-rules.html
export function DocumentPaper({ doc, party, items, source, settings, copy = 'original', className, preview = false }: {
  doc: PaperDoc; party: PaperParty | null; items: PaperItem[]; source?: { number: string; kind: Kind } | null
  settings: Settings; copy?: CopyKind; className?: string; preview?: boolean
}) {
  const Title = preview ? 'h2' : 'h1' // a preview sits on a page that already has its own h1
  const kind = doc.kind, cfg = KINDS[kind]
  const intra = doc.gst_type === 'cgst_sgst'
  const th = 'px-2 py-2 font-medium'
  const td = 'whitespace-nowrap px-2 py-2'
  const totalQty = items.reduce((s, i) => s + Number(i.qty), 0)
  const cols = 4 + (kind === 'challan' ? 1 : 0) + (cfg.money ? 3 : 0)

  return (
    <article className={cn('@container relative mx-auto max-w-[210mm] rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 sm:p-10 print:max-w-none print:rounded-none print:p-0 print:shadow-none print:ring-0', className)}>
      {doc.cancelled_at && (
        <div className="mb-6 rounded-md border-2 border-destructive px-4 py-3 text-destructive">
          <p className="text-lg font-semibold tracking-wide uppercase">Cancelled</p>
          <p className="text-sm">{date(doc.cancelled_at)}. {doc.cancel_reason}</p>
        </div>
      )}
      <header className="flex flex-col gap-4 @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-6">
        <Image src="/logo.png" alt="" width={110} height={110} priority />
        <div className="text-sm leading-snug @xl:text-right">
          <p className="font-heading text-2xl font-semibold">{settings.business_name}</p>
          <p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.address}</p>
          <p className="text-muted-foreground">{settings.phone}</p>
          {settings.email && <p className="text-muted-foreground">{settings.email}</p>}
          <p className="mt-1 font-medium">GSTIN {settings.gstin}</p>
        </div>
      </header>
      <div className="rule-brand my-5" />
      {kind === 'invoice' && <p className="mb-3 text-right text-xs tracking-wide text-muted-foreground uppercase">{COPY_LABEL[copy]}</p>}

      <div className="flex flex-col gap-3 @xl:flex-row @xl:items-end @xl:justify-between @xl:gap-6">
        <Title className="font-heading text-xl font-semibold">{cfg.title}</Title>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm @xl:grid-cols-[auto_auto]">
          <dt className="text-muted-foreground">{cfg.label} number</dt><dd className="text-right font-medium">{doc.number}</dd>
          <dt className="text-muted-foreground">Date</dt><dd className="text-right">{date(doc.date)}</dd>
          {kind === 'quotation' && doc.valid_until && <><dt className="text-muted-foreground">Valid until</dt><dd className="text-right">{date(doc.valid_until)}</dd></>}
          {kind === 'invoice' && doc.due_date && <><dt className="text-muted-foreground">Pay by</dt><dd className="text-right">{date(doc.due_date)}</dd></>}
          {doc.reference && <><dt className="text-muted-foreground">{kind === 'quotation' ? 'Reference' : kind === 'purchase' ? "Vendor's bill no" : 'Customer PO'}</dt><dd className="text-right">{doc.reference}</dd></>}
          {source && <><dt className="text-muted-foreground">{source.kind === 'invoice' ? 'Invoice' : 'Quotation'}</dt><dd className="text-right">{source.number}</dd></>}
          {kind === 'challan' && doc.eway_bill && <><dt className="text-muted-foreground">E-way bill</dt><dd className="text-right">{doc.eway_bill}</dd></>}
          {kind !== 'challan' && kind !== 'purchase' && party && <><dt className="text-muted-foreground">Place of supply</dt><dd className="text-right">{STATES[party.state_code]} ({party.state_code})</dd></>}
          {kind === 'invoice' && <><dt className="text-muted-foreground">Reverse charge</dt><dd className="text-right">No</dd></>}
        </dl>
      </div>

      <PartyBlock kind={kind} party={party} className="mt-6" />

      {kind === 'quotation' && (
        <p className="mt-6 text-sm leading-relaxed">
          Dear Sir or Madam, we are pleased to submit our quotation for the products below. We trust the offer is competitive and look forward to your purchase order. For any clarification, please contact us.
        </p>
      )}

      <div className="mt-6 overflow-x-auto"><table className="w-full text-sm tabular-nums">
        <thead className="border-b-2 border-foreground text-left text-muted-foreground">
          <tr>
            <th className={th}>S.No</th><th className={th}>Description</th><th className={th}>HSN/SAC</th>
            {kind === 'challan' && <th className={th}>Batch or serial</th>}
            <th className={`${th} text-right`}>Qty</th>
            {cfg.money && <><th className={`${th} text-right`}>Unit price</th><th className={`${th} text-right`}>{intra ? 'CGST + SGST' : 'IGST'}</th><th className={`${th} text-right`}>Total</th></>}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} className="border-b">
              <td className={`${td} text-muted-foreground`}>{i + 1}</td><td className="min-w-40 px-2 py-2">{it.description}</td><td className={td}>{it.hsn}</td>
              {kind === 'challan' && <td className={td}>{it.batch}</td>}
              <td className={`${td} text-right`}>{Number(it.qty)} {it.unit}</td>
              {cfg.money && <>
                <td className={`${td} text-right`}>{amount(it.rate)}</td>
                <td className={`${td} text-right`}>{amount(it.tax)}<span className="block text-xs text-muted-foreground">{Number(it.gst_rate)}%</span></td>
                <td className={`${td} text-right font-medium`}>{amount(Number(it.amount) + Number(it.tax))}</td>
              </>}
            </tr>
          ))}
          {items.length === 0 && <tr className="border-b"><td colSpan={cols} className="px-2 py-6 text-center text-muted-foreground">Lines appear here as you add them.</td></tr>}
        </tbody>
      </table></div>

      <div className="mt-4 flex flex-col gap-4 @xl:flex-row @xl:justify-between @xl:gap-8">
        <div className="max-w-sm text-sm">
          <p className="text-muted-foreground">{cfg.money ? 'Amount in words' : 'Quantity in words'}</p>
          <p className="font-medium">{cfg.money ? rupeesInWords(doc.total) : `${cap(numberToWords(Math.round(totalQty)))} units only`}</p>
          {doc.notes && <p className="mt-3 whitespace-pre-line text-muted-foreground">{doc.notes}</p>}
        </div>
        <dl className="w-full space-y-1 text-sm tabular-nums @xl:w-60">
          {cfg.money ? (
            <>
              <div className="flex justify-between"><dt className="text-muted-foreground">Taxable value</dt><dd>{amount(doc.subtotal)}</dd></div>
              {intra ? (
                <>
                  <div className="flex justify-between"><dt className="text-muted-foreground">CGST</dt><dd>{amount(doc.cgst)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">SGST</dt><dd>{amount(doc.sgst)}</dd></div>
                </>
              ) : (
                <div className="flex justify-between"><dt className="text-muted-foreground">IGST</dt><dd>{amount(doc.igst)}</dd></div>
              )}
              <div className="flex justify-between border-t-2 border-foreground pt-2 text-base font-semibold"><dt>Total</dt><dd>{amount(doc.total)}</dd></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total quantity</dt><dd>{totalQty}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total packages</dt><dd>{doc.packages ?? '–'}</dd></div>
            </>
          )}
        </dl>
      </div>

      {(kind === 'invoice' || kind === 'quotation') && <BankDetails title={kind === 'invoice' ? 'How to pay' : 'Our bank details'} bank={settings} />}
      {kind === 'purchase' && party && <BankDetails title="Vendor's bank details" bank={party} />}
      {kind === 'quotation' && settings.quotation_terms && (
        <section className="mt-8 text-sm"><p className="font-medium">Terms and conditions</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.quotation_terms}</p></section>
      )}
      {kind === 'challan' && settings.challan_notes && (
        <section className="mt-8 text-sm"><p className="font-medium">Notes</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.challan_notes}</p></section>
      )}

      <footer className="mt-12 flex flex-col gap-8 text-sm @xl:flex-row @xl:items-end @xl:justify-between">
        {kind === 'quotation' && (
          <div><p>Client acceptance</p><p className="mt-12 border-t border-foreground pt-1 text-muted-foreground">Signature, stamp and date</p></div>
        )}
        {kind === 'challan' && (
          <div className="max-w-xs">
            <p>Received the above goods in good condition</p>
            <p className="mt-6 text-muted-foreground">Name</p><p className="mt-4 text-muted-foreground">Designation</p><p className="mt-4 text-muted-foreground">Date and time</p>
            <p className="mt-6 border-t border-foreground pt-1 text-muted-foreground">Signature and stamp</p>
          </div>
        )}
        {kind === 'purchase' ? (
          <p className="text-muted-foreground">Internal record of the vendor&apos;s bill {doc.reference}. Keep the original for input tax credit.</p>
        ) : (
          <div className="text-right @xl:ml-auto">
            <p>For {settings.business_name}</p>
            <p className="mt-12 border-t border-foreground pt-1 text-muted-foreground">Authorised signatory</p>
          </div>
        )}
      </footer>
    </article>
  )
}

// The "Bill to" block. Also shown on its own while adding a customer or vendor.
export function PartyBlock({ kind, party, className }: { kind: Kind; party: PaperParty | null; className?: string }) {
  return (
    <section className={cn('rounded-md bg-muted p-4 text-sm print:border print:bg-transparent', className)}>
      <p className="text-muted-foreground">{kind === 'challan' ? 'Consignee (ship to)' : kind === 'quotation' ? 'To' : kind === 'purchase' ? 'Bought from' : 'Bill to'}</p>
      {party?.name ? (
        <>
          <p className="text-base font-semibold">{party.name}</p>
          {party.address && <p className="whitespace-pre-line">{party.address}</p>}
          <p>{party.gstin ? `GSTIN ${party.gstin}` : 'Unregistered'}</p>
          {party.phone && <p>{party.phone}</p>}
          {kind === 'challan' && <p>Place of supply: {STATES[party.state_code]} ({party.state_code})</p>}
        </>
      ) : (
        <p className="text-base text-muted-foreground">{kind === 'purchase' ? 'Vendor' : 'Customer'} name appears here</p>
      )}
    </section>
  )
}

export function BankDetails({ title, bank, className }: { title: string; bank: Partial<Bank>; className?: string }) {
  if (!bank.bank_name && !bank.bank_account && !bank.upi_id) return null
  return (
    <section className={cn('mt-8 rounded-md border p-4 text-sm', className)}>
      <p className="font-medium">{title}</p>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-muted-foreground">
        {bank.bank_name && <><dt>Bank</dt><dd className="text-foreground">{bank.bank_name}</dd></>}
        {bank.bank_account && <><dt>Account</dt><dd className="text-foreground">{bank.bank_account}</dd></>}
        {bank.bank_ifsc && <><dt>IFSC</dt><dd className="text-foreground">{bank.bank_ifsc}</dd></>}
        {bank.upi_id && <><dt>UPI</dt><dd className="text-foreground">{bank.upi_id}</dd></>}
      </dl>
    </section>
  )
}
