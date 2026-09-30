import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { sumPaid } from '@/lib/payments'
import { PrintButton } from '@/components/documents/print-button'

export const metadata: Metadata = { title: 'Outstanding' }

type Row = {
  id: string; number: string; date: string; due_date: string | null; total: string
  customers: { id: string; name: string; phone: string | null } | null
  vendors: { id: string; name: string; phone: string | null } | null
  payments: { amount: string }[] | null
}

const SIDES = {
  customers: { kind: 'invoice', path: '/invoices', title: 'Customers owe you', paid: 'Received', empty: 'Nobody owes you anything. Every invoice is paid.' },
  vendors: { kind: 'purchase', path: '/purchases', title: 'You owe vendors', paid: 'Paid', empty: 'You owe no vendor anything. Every purchase bill is paid.' },
} as const
type Side = keyof typeof SIDES

// Unpaid balances grouped by name, oldest first. Cancelled documents owe nothing and are left out.
export default async function OutstandingPage({ searchParams }: PageProps<'/outstanding'>) {
  const { side: raw } = await searchParams
  const side: Side = raw === 'vendors' ? 'vendors' : 'customers'
  const cfg = SIDES[side]
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('id, number, date, due_date, total, customers(id, name, phone), vendors(id, name, phone), payments(amount)')
    .eq('kind', cfg.kind).is('cancelled_at', null)
    .order('date').order('number')
    .returns<Row[]>()
  if (error) throw error

  const today = new Date().toISOString().slice(0, 10)
  const groups = new Map<string, { name: string; phone: string | null; due: number; docs: (Row & { paid: number; due: number })[] }>()
  for (const r of data) {
    const party = r.customers ?? r.vendors
    if (!party) continue
    const paid = sumPaid(r.payments)
    const due = Math.round((Number(r.total) - paid) * 100) / 100
    if (due <= 0.005) continue
    const g = groups.get(party.id) ?? { name: party.name, phone: party.phone, due: 0, docs: [] }
    g.docs.push({ ...r, paid, due })
    g.due = Math.round((g.due + due) * 100) / 100
    groups.set(party.id, g)
  }
  const list = [...groups.values()].sort((a, b) => b.due - a.due)
  const grand = Math.round(list.reduce((s, g) => s + g.due, 0) * 100) / 100
  const tab = (s: Side, label: string) => (
    <Link href={`/outstanding?side=${s}`} className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium transition ${side === s ? 'bg-tint text-brand-deep' : 'text-ink-soft hover:bg-tint'}`}>{label}</Link>
  )

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Outstanding</h1>
          <p className="text-sm text-ink-soft">Unpaid balances by name, largest first. Updated the moment a payment is recorded.</p>
        </div>
        <PrintButton />
      </div>
      <nav className="no-print mb-5 flex gap-1" aria-label="Outstanding side">{tab('customers', 'Customers')}{tab('vendors', 'Vendors')}</nav>

      <div className="mb-4 flex items-baseline justify-between rounded-lg border border-line bg-paper px-4 py-3">
        <h2 className="font-semibold">{cfg.title}</h2>
        <p className="text-lg font-semibold tabular-nums">{inr(grand)}</p>
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-paper p-8 text-center text-ink-soft">{cfg.empty}</p>
      ) : (
        <div className="space-y-4">
          {list.map((g) => (
            <section key={g.name + g.phone} className="break-inside-avoid overflow-x-auto rounded-lg border border-line bg-paper">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-tint px-4 py-2">
                <p className="font-semibold">{g.name}{g.phone && <span className="ml-2 text-sm font-normal text-ink-soft">{g.phone}</span>}</p>
                <p className="font-semibold tabular-nums">{inr(g.due)}</p>
              </div>
              <table className="w-full text-sm tabular-nums">
                <thead className="text-left text-ink-soft">
                  <tr><th className="px-4 py-2 font-medium">Number</th><th className="px-4 py-2 font-medium">Date</th><th className="hidden px-4 py-2 font-medium sm:table-cell">Pay by</th><th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Total</th><th className="hidden px-4 py-2 text-right font-medium sm:table-cell">{cfg.paid}</th><th className="px-4 py-2 text-right font-medium">Balance</th></tr>
                </thead>
                <tbody>
                  {g.docs.map((d) => (
                    <tr key={d.id} className="border-t border-line">
                      <td className="whitespace-nowrap px-4 py-2"><Link href={`${cfg.path}/${d.id}`} className="font-medium text-brand-deep hover:underline">{d.number}</Link></td>
                      <td className="whitespace-nowrap px-4 py-2">{formatDate(d.date)}</td>
                      <td className="hidden whitespace-nowrap px-4 py-2 sm:table-cell">{d.due_date ? formatDate(d.due_date) : '–'}{d.due_date && d.due_date < today && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Overdue</span>}</td>
                      <td className="hidden whitespace-nowrap px-4 py-2 text-right sm:table-cell">{inr(d.total)}</td>
                      <td className="hidden whitespace-nowrap px-4 py-2 text-right sm:table-cell">{inr(d.paid)}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-right font-medium">{inr(d.due)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
