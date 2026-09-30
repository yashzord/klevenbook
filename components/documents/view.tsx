import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { amount, inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { STATES } from '@/lib/states'
import { numberToWords, rupeesInWords } from '@/lib/words'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Settings, Vendor } from '@/lib/types'
import { PrintButton } from './print-button'
import { CancelForm } from './cancel-form'
import { ShareButtons } from './share-buttons'

type Doc = Invoice & { customers: Customer | null; vendors?: Vendor | null; invoice_items: InvoiceItem[]; source: { number: string; kind: Kind } | null }

// Layout follows the Kleven Care letterhead and templates. Invoice fields per CGST Rule 46: https://cbic-gst.gov.in/cgst-rules.html
export type CopyKind = 'original' | 'duplicate' | 'triplicate'
const COPY_LABEL: Record<CopyKind, string> = { original: 'Original for recipient', duplicate: 'Duplicate for transporter', triplicate: 'Triplicate for supplier' }

export function DocumentView({ doc, settings, shareUrl, copy = 'original' }: { doc: Doc; settings: Settings; shareUrl?: string; copy?: CopyKind }) {
  const kind = doc.kind, cfg = KINDS[kind], c = (doc.customers ?? doc.vendors)!
  const intra = doc.gst_type === 'cgst_sgst'
  const th = 'px-2 py-2 font-medium'
  const td = 'whitespace-nowrap px-2 py-2'
  const totalQty = doc.invoice_items.reduce((s, i) => s + Number(i.qty), 0)
  const next = kind === 'quotation' ? { href: `/invoices/new?from=${doc.id}`, label: 'Make invoice from this quotation' }
    : kind === 'invoice' ? { href: `/challans/new?from=${doc.id}`, label: 'Make delivery challan' } : null

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        {shareUrl ? <Button asChild variant="ghost" className="-ml-3 text-muted-foreground"><Link href={cfg.path}><ArrowLeft /> All {cfg.plural.toLowerCase()}</Link></Button> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          {shareUrl && !doc.cancelled_at && <CancelForm id={doc.id} label={cfg.label.toLowerCase()} />}
          {shareUrl && !doc.cancelled_at && <Button asChild variant="outline"><Link href={`${cfg.path}/${doc.id}/edit`}><Pencil /> Edit</Link></Button>}
          {shareUrl && next && !doc.cancelled_at && <Button asChild variant="outline"><Link href={next.href}>{next.label}</Link></Button>}
          {shareUrl && cfg.party === 'customer' && <ShareButtons url={shareUrl} phone={c.phone} text={`Hello ${c.name}, here is ${cfg.label.toLowerCase()} ${doc.number} from ${settings.business_name}${cfg.money ? ` for ${inr(doc.total)}` : ''}: ${shareUrl}`} />}
          <PrintButton />
        </div>
      </div>
      {shareUrl && kind === 'invoice' && (
        <div className="no-print mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <span className="mr-1">Print as</span>
          {(['original', 'duplicate', 'triplicate'] as CopyKind[]).map((k) => (
            <Button key={k} asChild size="sm" variant={copy === k ? 'secondary' : 'ghost'} className="capitalize"><Link href={`?copy=${k}`} scroll={false}>{k}</Link></Button>
          ))}
        </div>
      )}
      <article className="relative mx-auto max-w-[210mm] rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 sm:p-10 print:max-w-none print:rounded-none print:p-0 print:shadow-none print:ring-0">
        {doc.cancelled_at && (
          <div className="mb-6 rounded-md border-2 border-red-700 px-4 py-3 text-red-700 print:border-red-700">
            <p className="text-lg font-semibold uppercase tracking-wide">Cancelled</p>
            <p className="text-sm">{formatDate(doc.cancelled_at.slice(0, 10))}. {doc.cancel_reason}</p>
          </div>
        )}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <Image src="/logo.png" alt="" width={110} height={110} priority />
          <div className="text-sm leading-snug sm:text-right">
            <p className="text-2xl font-semibold">{settings.business_name}</p>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.address}</p>
            <p className="text-muted-foreground">{settings.phone}</p>
            {settings.email && <p className="text-muted-foreground">{settings.email}</p>}
            <p className="mt-1 font-medium">GSTIN {settings.gstin}</p>
          </div>
        </header>
        <div className="rule-brand my-5" />
        {kind === 'invoice' && <p className="mb-3 text-right text-xs uppercase tracking-wide text-muted-foreground">{COPY_LABEL[copy]}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h1 className="text-xl font-semibold">{cfg.title}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm sm:grid-cols-[auto_auto]">
            <dt className="text-muted-foreground">{cfg.label} number</dt><dd className="text-right font-medium">{doc.number}</dd>
            <dt className="text-muted-foreground">Date</dt><dd className="text-right">{formatDate(doc.date)}</dd>
            {kind === 'quotation' && doc.valid_until && <><dt className="text-muted-foreground">Valid until</dt><dd className="text-right">{formatDate(doc.valid_until)}</dd></>}
            {kind === 'invoice' && doc.due_date && <><dt className="text-muted-foreground">Pay by</dt><dd className="text-right">{formatDate(doc.due_date)}</dd></>}
            {doc.reference && <><dt className="text-muted-foreground">{kind === 'quotation' ? 'Reference' : kind === 'purchase' ? "Vendor's bill no" : 'Customer PO'}</dt><dd className="text-right">{doc.reference}</dd></>}
            {doc.source && <><dt className="text-muted-foreground">{doc.source.kind === 'invoice' ? 'Invoice' : 'Quotation'}</dt><dd className="text-right">{doc.source.number}</dd></>}
            {kind === 'challan' && doc.eway_bill && <><dt className="text-muted-foreground">E-way bill</dt><dd className="text-right">{doc.eway_bill}</dd></>}
            {kind !== 'challan' && kind !== 'purchase' && <><dt className="text-muted-foreground">Place of supply</dt><dd className="text-right">{STATES[c.state_code]} ({c.state_code})</dd></>}
            {kind === 'invoice' && <><dt className="text-muted-foreground">Reverse charge</dt><dd className="text-right">No</dd></>}
          </dl>
        </div>

        <section className="mt-6 rounded-md bg-muted p-4 text-sm print:border print:border-border print:bg-transparent">
          <p className="text-muted-foreground">{kind === 'challan' ? 'Consignee (ship to)' : kind === 'quotation' ? 'To' : kind === 'purchase' ? 'Bought from' : 'Bill to'}</p>
          <p className="text-base font-semibold">{c.name}</p>
          {c.address && <p className="whitespace-pre-line">{c.address}</p>}
          <p>{c.gstin ? `GSTIN ${c.gstin}` : 'Unregistered'}</p>
          {c.phone && <p>{c.phone}</p>}
          {kind === 'challan' && <p>Place of supply: {STATES[c.state_code]} ({c.state_code})</p>}
        </section>

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
            {doc.invoice_items.map((it, i) => (
              <tr key={it.id} className="border-b border-border">
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
          </tbody>
        </table></div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-8">
          <div className="max-w-sm text-sm">
            <p className="text-muted-foreground">{cfg.money ? 'Amount in words' : 'Quantity in words'}</p>
            <p className="font-medium">{cfg.money ? rupeesInWords(doc.total) : `${cap(numberToWords(Math.round(totalQty)))} units only`}</p>
            {doc.notes && <p className="mt-3 whitespace-pre-line text-muted-foreground">{doc.notes}</p>}
          </div>
          <dl className="w-full space-y-1 text-sm tabular-nums sm:w-60">
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
        {kind === 'purchase' && doc.vendors && <BankDetails title="Vendor's bank details" bank={doc.vendors} />}
        {kind === 'quotation' && settings.quotation_terms && (
          <section className="mt-8 text-sm"><p className="font-medium">Terms and conditions</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.quotation_terms}</p></section>
        )}
        {kind === 'challan' && settings.challan_notes && (
          <section className="mt-8 text-sm"><p className="font-medium">Notes</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{settings.challan_notes}</p></section>
        )}

        <footer className="mt-12 flex flex-col gap-8 text-sm sm:flex-row sm:items-end sm:justify-between">
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
            <div className="text-right sm:ml-auto">
              <p>For {settings.business_name}</p>
              <p className="mt-12 border-t border-foreground pt-1 text-muted-foreground">Authorised signatory</p>
            </div>
          )}
        </footer>
      </article>
    </>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Bank = { bank_name: string | null; bank_account: string | null; bank_ifsc: string | null; upi_id: string | null }

function BankDetails({ title, bank }: { title: string; bank: Bank }) {
  if (!bank.bank_name && !bank.bank_account && !bank.upi_id) return null
  return (
    <section className="mt-8 rounded-md border border-border p-4 text-sm">
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
