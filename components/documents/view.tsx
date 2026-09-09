import Image from 'next/image'
import Link from 'next/link'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { STATES } from '@/lib/states'
import { numberToWords, rupeesInWords } from '@/lib/words'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Settings } from '@/lib/types'
import { PrintButton } from './print-button'
import { CancelForm } from './cancel-form'

type Doc = Invoice & { customers: Customer; invoice_items: InvoiceItem[]; source: { number: string; kind: Kind } | null }

// Layout follows the Kleven Care letterhead and templates. Invoice fields per CGST Rule 46: https://cbic-gst.gov.in/cgst-rules.html
export function DocumentView({ doc, settings }: { doc: Doc; settings: Settings }) {
  const kind = doc.kind, cfg = KINDS[kind], c = doc.customers
  const intra = doc.gst_type === 'cgst_sgst'
  const th = 'px-2 py-2 font-medium'
  const td = 'whitespace-nowrap px-2 py-2'
  const totalQty = doc.invoice_items.reduce((s, i) => s + Number(i.qty), 0)
  const next = kind === 'quotation' ? { href: `/invoices/new?from=${doc.id}`, label: 'Make invoice from this quotation' }
    : kind === 'invoice' ? { href: `/challans/new?from=${doc.id}`, label: 'Make delivery challan' } : null

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={cfg.path} className="text-sm text-ink-soft hover:text-ink">← All {cfg.plural.toLowerCase()}</Link>
        <div className="flex flex-wrap items-center gap-2">
          {!doc.cancelled_at && <CancelForm id={doc.id} label={cfg.label.toLowerCase()} />}
          {next && !doc.cancelled_at && <Link href={next.href} className="rounded-md border border-line bg-paper px-4 py-2 font-medium text-brand-deep transition hover:bg-tint">{next.label}</Link>}
          <PrintButton />
        </div>
      </div>
      <article className="relative mx-auto max-w-[210mm] rounded-lg border border-line bg-paper p-5 sm:p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
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
            <p className="mt-1 whitespace-pre-line text-ink-soft">{settings.address}</p>
            <p className="text-ink-soft">{settings.phone}</p>
            {settings.email && <p className="text-ink-soft">{settings.email}</p>}
            <p className="mt-1 font-medium">GSTIN {settings.gstin}</p>
          </div>
        </header>
        <div className="rule-brand my-5" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h1 className="text-xl font-semibold">{cfg.title}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm sm:grid-cols-[auto_auto]">
            <dt className="text-ink-soft">{cfg.label} number</dt><dd className="text-right font-medium">{doc.number}</dd>
            <dt className="text-ink-soft">Date</dt><dd className="text-right">{formatDate(doc.date)}</dd>
            {kind === 'quotation' && doc.valid_until && <><dt className="text-ink-soft">Valid until</dt><dd className="text-right">{formatDate(doc.valid_until)}</dd></>}
            {doc.reference && <><dt className="text-ink-soft">{kind === 'quotation' ? 'Reference' : 'Customer PO'}</dt><dd className="text-right">{doc.reference}</dd></>}
            {doc.source && <><dt className="text-ink-soft">{doc.source.kind === 'invoice' ? 'Invoice' : 'Quotation'}</dt><dd className="text-right">{doc.source.number}</dd></>}
            {kind === 'challan' && doc.eway_bill && <><dt className="text-ink-soft">E-way bill</dt><dd className="text-right">{doc.eway_bill}</dd></>}
            {kind !== 'challan' && <><dt className="text-ink-soft">Place of supply</dt><dd className="text-right">{STATES[c.state_code]} ({c.state_code})</dd></>}
            {kind === 'invoice' && <><dt className="text-ink-soft">Reverse charge</dt><dd className="text-right">No</dd></>}
          </dl>
        </div>

        <section className="mt-6 rounded-md bg-tint p-4 text-sm print:border print:border-line print:bg-transparent">
          <p className="text-ink-soft">{kind === 'challan' ? 'Consignee (ship to)' : kind === 'quotation' ? 'To' : 'Bill to'}</p>
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
          <thead className="border-b-2 border-ink text-left text-ink-soft">
            <tr>
              <th className={th}>#</th><th className={th}>Description</th><th className={th}>HSN</th>
              {kind === 'challan' && <th className={th}>Batch or serial</th>}
              <th className={`${th} text-right`}>Qty</th>
              {cfg.money && <><th className={`${th} text-right`}>Rate</th><th className={`${th} text-right`}>Taxable</th><th className={`${th} text-right`}>GST</th><th className={`${th} text-right`}>Tax</th></>}
            </tr>
          </thead>
          <tbody>
            {doc.invoice_items.map((it, i) => (
              <tr key={it.id} className="border-b border-line">
                <td className={`${td} text-ink-soft`}>{i + 1}</td><td className={td}>{it.description}</td><td className={td}>{it.hsn}</td>
                {kind === 'challan' && <td className={td}>{it.batch}</td>}
                <td className={`${td} text-right`}>{Number(it.qty)} {it.unit}</td>
                {cfg.money && <>
                  <td className={`${td} text-right`}>{inr(it.rate)}</td><td className={`${td} text-right`}>{inr(it.amount)}</td>
                  <td className={`${td} text-right`}>{Number(it.gst_rate)}%</td><td className={`${td} text-right`}>{inr(it.tax)}</td>
                </>}
              </tr>
            ))}
          </tbody>
        </table></div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-8">
          <div className="max-w-sm text-sm">
            <p className="text-ink-soft">{cfg.money ? 'Amount in words' : 'Quantity in words'}</p>
            <p className="font-medium">{cfg.money ? rupeesInWords(doc.total) : `${cap(numberToWords(Math.round(totalQty)))} units only`}</p>
            {doc.notes && <p className="mt-3 whitespace-pre-line text-ink-soft">{doc.notes}</p>}
          </div>
          <dl className="w-full space-y-1 text-sm tabular-nums sm:w-60">
            {cfg.money ? (
              <>
                <div className="flex justify-between"><dt className="text-ink-soft">Taxable value</dt><dd>{inr(doc.subtotal)}</dd></div>
                {intra ? (
                  <>
                    <div className="flex justify-between"><dt className="text-ink-soft">CGST</dt><dd>{inr(doc.cgst)}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-soft">SGST</dt><dd>{inr(doc.sgst)}</dd></div>
                  </>
                ) : (
                  <div className="flex justify-between"><dt className="text-ink-soft">IGST</dt><dd>{inr(doc.igst)}</dd></div>
                )}
                <div className="flex justify-between border-t-2 border-ink pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(doc.total)}</dd></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><dt className="text-ink-soft">Total quantity</dt><dd>{totalQty}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">Total packages</dt><dd>{doc.packages ?? '–'}</dd></div>
              </>
            )}
          </dl>
        </div>

        {kind === 'quotation' && settings.quotation_terms && (
          <section className="mt-8 text-sm"><p className="font-medium">Terms and conditions</p><p className="mt-1 whitespace-pre-line text-ink-soft">{settings.quotation_terms}</p></section>
        )}
        {kind === 'challan' && settings.challan_notes && (
          <section className="mt-8 text-sm"><p className="font-medium">Notes</p><p className="mt-1 whitespace-pre-line text-ink-soft">{settings.challan_notes}</p></section>
        )}

        <footer className="mt-12 flex flex-col gap-8 text-sm sm:flex-row sm:items-end sm:justify-between">
          {kind === 'quotation' && (
            <div><p>Client acceptance</p><p className="mt-12 border-t border-ink pt-1 text-ink-soft">Signature, stamp and date</p></div>
          )}
          {kind === 'challan' && (
            <div className="max-w-xs">
              <p>Received the above goods in good condition</p>
              <p className="mt-6 text-ink-soft">Name</p><p className="mt-4 text-ink-soft">Designation</p><p className="mt-4 text-ink-soft">Date and time</p>
              <p className="mt-6 border-t border-ink pt-1 text-ink-soft">Signature and stamp</p>
            </div>
          )}
          {kind === 'invoice' && <p className="text-ink-soft">Subject to Hyderabad jurisdiction. Thank you for your business.</p>}
          <div className="text-right">
            <p>For {settings.business_name}</p>
            <p className="mt-12 border-t border-ink pt-1 text-ink-soft">Authorised signatory</p>
          </div>
        </footer>
      </article>
    </>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
