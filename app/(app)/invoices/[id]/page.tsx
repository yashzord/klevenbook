import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { STATES } from '@/lib/states'
import { rupeesInWords } from '@/lib/words'
import type { Customer, Invoice, InvoiceItem, Settings } from '@/lib/types'
import { PrintButton } from './print-button'

// Layout follows the Kleven Care letterhead. Mandatory fields per CGST Rule 46: https://cbic-gst.gov.in/cgst-rules.html
export default async function InvoicePage({ params }: PageProps<'/invoices/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: invoice }, { data: settings }] = await Promise.all([
    supabase.from('invoices').select('*, customers(*), invoice_items(*)').eq('id', id).single<Invoice & { customers: Customer; invoice_items: InvoiceItem[] }>(),
    supabase.from('settings').select('*').single<Settings>(),
  ])
  if (!invoice || !settings) notFound()
  const c = invoice.customers
  const intra = invoice.gst_type === 'cgst_sgst'
  const th = 'px-2 py-2 font-medium'

  return (
    <>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">← All invoices</Link>
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[210mm] rounded-lg border border-line bg-paper p-8 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6">
          <Image src="/logo.png" alt="" width={110} height={110} priority />
          <div className="text-right text-sm leading-snug">
            <p className="text-2xl font-semibold">{settings.business_name}</p>
            <p className="mt-1 whitespace-pre-line text-ink-soft">{settings.address}</p>
            <p className="text-ink-soft">{settings.phone}</p>
            {settings.email && <p className="text-ink-soft">{settings.email}</p>}
            <p className="mt-1 font-medium">GSTIN {settings.gstin}</p>
          </div>
        </header>
        <div className="rule-brand my-5" />

        <div className="flex items-end justify-between">
          <h1 className="text-xl font-semibold">Tax invoice</h1>
          <dl className="grid grid-cols-[auto_auto] gap-x-4 text-sm">
            <dt className="text-ink-soft">Invoice number</dt><dd className="text-right font-medium">{invoice.number}</dd>
            <dt className="text-ink-soft">Date</dt><dd className="text-right">{formatDate(invoice.date)}</dd>
            <dt className="text-ink-soft">Place of supply</dt><dd className="text-right">{STATES[c.state_code]} ({c.state_code})</dd>
            <dt className="text-ink-soft">Reverse charge</dt><dd className="text-right">No</dd>
          </dl>
        </div>

        <section className="mt-6 rounded-md bg-tint p-4 text-sm print:bg-transparent print:border print:border-line">
          <p className="text-ink-soft">Bill to</p>
          <p className="text-base font-semibold">{c.name}</p>
          {c.address && <p className="whitespace-pre-line">{c.address}</p>}
          <p>{c.gstin ? `GSTIN ${c.gstin}` : 'Unregistered'}</p>
          {c.phone && <p>{c.phone}</p>}
        </section>

        <table className="mt-6 w-full text-sm tabular-nums">
          <thead className="border-b-2 border-ink text-left text-ink-soft">
            <tr><th className={th}>#</th><th className={th}>Description</th><th className={th}>HSN</th><th className={`${th} text-right`}>Qty</th><th className={`${th} text-right`}>Rate</th><th className={`${th} text-right`}>Taxable</th><th className={`${th} text-right`}>GST</th><th className={`${th} text-right`}>Tax</th></tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((it, i) => (
              <tr key={it.id} className="border-b border-line">
                <td className="px-2 py-2 text-ink-soft">{i + 1}</td><td className="px-2 py-2">{it.description}</td><td className="px-2 py-2">{it.hsn}</td>
                <td className="px-2 py-2 text-right">{Number(it.qty)} {it.unit}</td><td className="px-2 py-2 text-right">{inr(it.rate)}</td>
                <td className="px-2 py-2 text-right">{inr(it.amount)}</td><td className="px-2 py-2 text-right">{Number(it.gst_rate)}%</td><td className="px-2 py-2 text-right">{inr(it.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-between gap-8">
          <div className="max-w-sm text-sm">
            <p className="text-ink-soft">Amount in words</p>
            <p className="font-medium">{rupeesInWords(invoice.total)}</p>
            {invoice.notes && <p className="mt-3 whitespace-pre-line text-ink-soft">{invoice.notes}</p>}
          </div>
          <dl className="w-60 space-y-1 text-sm tabular-nums">
            <div className="flex justify-between"><dt className="text-ink-soft">Taxable value</dt><dd>{inr(invoice.subtotal)}</dd></div>
            {intra ? (
              <>
                <div className="flex justify-between"><dt className="text-ink-soft">CGST</dt><dd>{inr(invoice.cgst)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-soft">SGST</dt><dd>{inr(invoice.sgst)}</dd></div>
              </>
            ) : (
              <div className="flex justify-between"><dt className="text-ink-soft">IGST</dt><dd>{inr(invoice.igst)}</dd></div>
            )}
            <div className="flex justify-between border-t-2 border-ink pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(invoice.total)}</dd></div>
          </dl>
        </div>

        <footer className="mt-12 flex items-end justify-between text-sm">
          <p className="text-ink-soft">Subject to Hyderabad jurisdiction. Thank you for your business.</p>
          <div className="text-right">
            <p>For {settings.business_name}</p>
            <p className="mt-12 border-t border-ink pt-1 text-ink-soft">Authorised signatory</p>
          </div>
        </footer>
      </article>
    </>
  )
}
