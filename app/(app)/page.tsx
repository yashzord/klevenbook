import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, type Kind } from '@/lib/documents'
import { sumPaid } from '@/lib/payments'
import { IconCheck } from '@/components/icons'

type Owed = { id: string; number: string; date: string; due_date: string | null; total: string; customers: { name: string } | null; vendors: { name: string } | null; payments: { amount: string }[] | null }
type Recent = { id: string; kind: Kind; number: string; date: string; total: string; cancelled_at: string | null; customers: { name: string } | null; vendors: { name: string } | null }

// Home: a checklist that ticks itself off from real data, then quick actions and recent documents.
export const metadata: Metadata = { title: 'Home' }
export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: settings }, { count: products }, { count: customers }, { count: invoices }, { count: paymentsCount }, { data: recent }, { data: open }, { data: openPurchases }] = await Promise.all([
    supabase.from('settings').select('business_name, gstin').single<{ business_name: string; gstin: string | null }>(),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('kind', 'invoice'),
    supabase.from('payments').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('id, kind, number, date, total, cancelled_at, customers(name), vendors(name)').order('created_at', { ascending: false }).limit(8).returns<Recent[]>(),
    supabase.from('invoices').select('id, number, date, due_date, total, customers(name), vendors(name), payments(amount)').eq('kind', 'invoice').is('cancelled_at', null).order('date').returns<Owed[]>(),
    supabase.from('invoices').select('id, number, date, due_date, total, customers(name), vendors(name), payments(amount)').eq('kind', 'purchase').is('cancelled_at', null).order('date').returns<Owed[]>(),
  ])
  const withDue = (rows: Owed[] | null) => (rows ?? []).map((o) => ({ ...o, due: Math.round((Number(o.total) - sumPaid(o.payments)) * 100) / 100 })).filter((o) => o.due > 0.005)
  const owed = withDue(open), owing = withDue(openPurchases)
  const sumDue = (rows: { due: number }[]) => Math.round(rows.reduce((s, o) => s + o.due, 0) * 100) / 100
  const owedTotal = sumDue(owed), owingTotal = sumDue(owing)
  const today = new Date().toISOString().slice(0, 10)

  const steps = [
    { done: !!settings?.gstin && settings.business_name !== 'My Business', href: '/settings', title: 'Add your business details', why: 'Name, GSTIN and address print at the top of every document.' },
    { done: (products ?? 0) > 0, href: '/products', title: 'Add a product', why: 'Name, HSN code, GST rate and list price. You can change the price on any document.' },
    { done: (customers ?? 0) > 0, href: '/customers', title: 'Add a customer', why: 'Their GSTIN decides whether the invoice carries CGST and SGST or IGST.' },
    { done: (invoices ?? 0) > 0, href: '/invoices/new', title: 'Make your first invoice', why: 'Pick the customer, add lines, and print or save it as a PDF.' },
    { done: (paymentsCount ?? 0) > 0, href: '/invoices', title: 'Record a payment', why: 'Open an invoice and enter what came in. Home then shows who still owes you.' },
  ]
  const remaining = steps.filter((s) => !s.done).length
  const firstOpen = steps.find((s) => !s.done)

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Welcome, {settings?.business_name}</h1>
      <p className="mb-6 text-sm text-ink-soft">{remaining === 0 ? 'Everything is set up. Start from a quick action below.' : `${remaining} of ${steps.length} setup steps left.`}</p>

      {remaining > 0 && (
        <section className="mb-8 rounded-lg border border-line bg-paper">
          <h2 className="border-b border-line px-4 py-3 font-semibold">Getting started</h2>
          <ol className="divide-y divide-line">
            {steps.map((s, i) => (
              <li key={s.href} className={`flex items-start gap-4 px-4 py-3 ${s.done ? 'text-ink-soft' : ''}`}>
                <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${s.done ? 'bg-leaf text-white' : s === firstOpen ? 'bg-brand text-white' : 'border border-line'}`}>{s.done ? <IconCheck /> : i + 1}</span>
                <div className="flex-1">
                  <p className={s.done ? 'line-through' : 'font-medium'}>{s.title}</p>
                  <p className="text-sm text-ink-soft">{s.why}</p>
                </div>
                {!s.done && <Link href={s.href} className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${s === firstOpen ? 'bg-leaf text-white hover:bg-leaf-deep' : 'text-brand hover:bg-tint'}`}>{s === firstOpen ? 'Do this next' : 'Open'}</Link>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        {(['quotation', 'invoice', 'challan'] as Kind[]).map((k) => (
          <Link key={k} href={`${KINDS[k].path}/new`} className="rounded-lg border border-line bg-paper p-4 transition hover:border-brand hover:bg-tint">
            <p className="font-medium">New {KINDS[k].label.toLowerCase()}</p>
            <p className="mt-1 text-sm text-ink-soft">{k === 'quotation' ? 'A price offer before the order. Turns into an invoice in one click.' : k === 'invoice' ? 'The tax document for a sale. GST is worked out per line.' : 'Goes with the goods. Quantities and batch numbers, no prices.'}</p>
          </Link>
        ))}
      </section>

      {owed.length > 0 && (
        <section className="mb-8">
          <div className="mb-2 flex items-baseline justify-between"><h2 className="font-semibold">Owed to you</h2><span className="text-sm tabular-nums text-amber-800">{inr(owedTotal)} across {owed.length} {owed.length === 1 ? 'invoice' : 'invoices'}</span></div>
          <div className="overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <tbody>
                {owed.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-line first:border-t-0 hover:bg-tint/60">
                    <td className="whitespace-nowrap px-4 py-2"><Link href={`/invoices/${o.id}`} className="font-medium text-brand-deep hover:underline">{o.number}</Link></td>
                    <td className="px-4 py-2">{o.customers?.name}{o.due_date && o.due_date < today && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Overdue</span>}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2 text-ink-soft sm:table-cell">{formatDate(o.date)}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">{inr(o.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {owing.length > 0 && (
        <section className="mb-8">
          <div className="mb-2 flex items-baseline justify-between"><h2 className="font-semibold">You owe vendors</h2><span className="text-sm tabular-nums text-ink-soft">{inr(owingTotal)} across {owing.length} {owing.length === 1 ? 'bill' : 'bills'}</span></div>
          <div className="overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <tbody>
                {owing.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-line first:border-t-0 hover:bg-tint/60">
                    <td className="whitespace-nowrap px-4 py-2"><Link href={`/purchases/${o.id}`} className="font-medium text-brand-deep hover:underline">{o.number}</Link></td>
                    <td className="px-4 py-2">{o.vendors?.name}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2 text-ink-soft sm:table-cell">{formatDate(o.date)}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">{inr(o.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recent && recent.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Recent documents</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className={`border-t border-line first:border-t-0 hover:bg-tint/60 ${d.cancelled_at ? 'text-ink-soft' : ''}`}>
                    <td className="hidden px-4 py-2 text-ink-soft sm:table-cell">{KINDS[d.kind].label}</td>
                    <td className="whitespace-nowrap px-4 py-2"><Link href={`${KINDS[d.kind].path}/${d.id}`} className="font-medium text-brand-deep hover:underline">{d.number}</Link>{d.cancelled_at && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Cancelled</span>}</td>
                    <td className="px-4 py-2">{(d.customers ?? d.vendors)?.name}</td>
                    <td className="hidden whitespace-nowrap px-4 py-2 text-ink-soft sm:table-cell">{formatDate(d.date)}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">{KINDS[d.kind].money ? inr(d.total) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
