import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, PAYABLE, type Kind } from '@/lib/documents'
import { ExportForm } from './export-form'
import { payStatus, STATUS_CLASS, STATUS_LABEL, sumPaid } from '@/lib/payments'

const HINT: Record<Kind, string> = {
  invoice: 'Tax documents for sales. Download the CSV for your CA at month end.',
  quotation: 'Price offers. Open one and press Make invoice when the customer confirms.',
  challan: 'Travels with the goods. Start one from an invoice so the lines match.',
  purchase: 'Bills from your vendors, entered as they arrive. Download the CSV for input tax credit.',
}

type Row = { id: string; number: string; date: string; total: string; packages: number | null; cancelled_at: string | null; customers: { name: string } | null; vendors: { name: string } | null; payments: { amount: string }[] | null }

export async function DocumentList({ kind }: { kind: Kind }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const { data: docs, error } = await supabase
    .from('invoices')
    .select(`id, number, date, total, packages, cancelled_at, ${cfg.party === 'vendor' ? 'vendors(name)' : 'customers(name)'}${PAYABLE.includes(kind) ? ', payments(amount)' : ''}`)
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .returns<Row[]>()
  if (error) throw error

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{cfg.plural}</h1>
          <p className="text-sm text-ink-soft">{HINT[kind]}</p>
        </div>
        <div className="flex items-center gap-3">
          {(kind === 'invoice' || kind === 'purchase') && docs.length > 0 && <ExportForm kind={kind} />}
          <Link href={`${cfg.path}/new`} className="inline-flex min-h-11 items-center rounded-md bg-leaf px-4 py-2 font-medium text-white transition hover:bg-leaf-deep">New {cfg.label.toLowerCase()}</Link>
        </div>
      </div>
      {docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
          <p className="font-medium">No {cfg.plural.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-ink-soft">
            {kind === 'challan' ? 'Open an invoice and choose Make delivery challan, or start one from scratch.' : kind === 'purchase' ? 'Add a vendor first, then enter their bill here.' : 'You need a product and a customer first, then create one.'}
          </p>
          <div className="mt-4 flex justify-center gap-3 text-sm">
            <Link href="/products" className="text-brand hover:underline">Products</Link>
            <Link href={cfg.party === 'vendor' ? '/vendors' : '/customers'} className="text-brand hover:underline">{cfg.party === 'vendor' ? 'Vendors' : 'Customers'}</Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-tint text-left text-ink-soft">
              <tr><th className="px-4 py-2 font-medium">Number</th><th className="hidden px-4 py-2 font-medium sm:table-cell">Date</th><th className="px-4 py-2 font-medium">{cfg.party === 'vendor' ? 'Vendor' : 'Customer'}</th><th className="px-4 py-2 text-right font-medium">{cfg.money ? 'Total' : 'Packages'}</th>{PAYABLE.includes(kind) && <th className="px-4 py-2 font-medium">Status</th>}</tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className={`border-t border-line transition hover:bg-tint/60 ${d.cancelled_at ? 'text-ink-soft' : ''}`}>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Link href={`${cfg.path}/${d.id}`} className="font-medium text-brand-deep hover:underline">{d.number}</Link>
                    {d.cancelled_at && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Cancelled</span>}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-2 sm:table-cell">{formatDate(d.date)}</td>
                  <td className="px-4 py-2">{(d.customers ?? d.vendors)?.name}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">{cfg.money ? inr(d.total) : d.packages ?? '–'}</td>
                  {PAYABLE.includes(kind) && (() => { const st = payStatus(d.total, sumPaid(d.payments), !!d.cancelled_at); return <td className="px-4 py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[st]}`}>{STATUS_LABEL[st]}</span></td> })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
