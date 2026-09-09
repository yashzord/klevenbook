import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { STATES } from '@/lib/states'
import type { Customer, Invoice, InvoiceItem, Settings } from '@/lib/types'
import { PrintButton } from './print-button'

// Mandatory tax-invoice fields per CGST Rule 46: https://cbic-gst.gov.in/cgst-rules.html
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

  return (
    <div className="bg-white p-8 shadow print:shadow-none">
      <div className="mb-4 flex justify-end"><PrintButton /></div>
      <div className="flex justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">{settings.business_name}</h1>
          <p className="whitespace-pre-line text-sm">{settings.address}</p>
          <p className="text-sm">GSTIN: {settings.gstin} · {settings.phone} · {settings.email}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">TAX INVOICE</h2>
          <p>No: <b>{invoice.number}</b></p>
          <p>Date: {invoice.date}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 py-4 text-sm">
        <div>
          <p className="font-semibold">Bill to</p>
          <p>{c.name}</p>
          <p className="whitespace-pre-line">{c.address}</p>
          {c.gstin && <p>GSTIN: {c.gstin}</p>}
          <p>{c.phone}</p>
        </div>
        <div className="text-right">
          <p>Place of supply: {c.state_code} {STATES[c.state_code]}</p>
          <p>Reverse charge: No</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="border-y bg-slate-50 text-left">
          <tr><th className="p-2">#</th><th className="p-2">Description</th><th className="p-2">HSN</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Taxable</th><th className="p-2 text-right">GST %</th><th className="p-2 text-right">Tax</th></tr>
        </thead>
        <tbody>
          {invoice.invoice_items.map((it, i) => (
            <tr key={it.id} className="border-b">
              <td className="p-2">{i + 1}</td><td className="p-2">{it.description}</td><td className="p-2">{it.hsn}</td>
              <td className="p-2 text-right">{Number(it.qty)} {it.unit}</td><td className="p-2 text-right">{inr(it.rate)}</td>
              <td className="p-2 text-right">{inr(it.amount)}</td><td className="p-2 text-right">{Number(it.gst_rate)}</td><td className="p-2 text-right">{inr(it.tax)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto mt-4 w-64 text-sm">
        <div className="flex justify-between"><span>Taxable value</span><span>{inr(invoice.subtotal)}</span></div>
        {intra ? (
          <>
            <div className="flex justify-between"><span>CGST</span><span>{inr(invoice.cgst)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>{inr(invoice.sgst)}</span></div>
          </>
        ) : (
          <div className="flex justify-between"><span>IGST</span><span>{inr(invoice.igst)}</span></div>
        )}
        <div className="mt-1 flex justify-between border-t pt-1 text-base font-bold"><span>Total</span><span>{inr(invoice.total)}</span></div>
      </div>
      {invoice.notes && <p className="mt-4 text-sm">{invoice.notes}</p>}
      <p className="mt-12 text-right text-sm">For {settings.business_name}<br /><br /><br />Authorised signatory</p>
    </div>
  )
}
