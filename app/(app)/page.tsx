import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, type Kind } from '@/lib/documents'

type Recent = { id: string; kind: Kind; number: string; date: string; total: string; cancelled_at: string | null; customers: { name: string } | null }

// Home: a checklist that ticks itself off from real data, then quick actions and recent documents.
export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: settings }, { count: products }, { count: customers }, { count: invoices }, { data: recent }] = await Promise.all([
    supabase.from('settings').select('business_name, gstin').single<{ business_name: string; gstin: string | null }>(),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('kind', 'invoice'),
    supabase.from('invoices').select('id, kind, number, date, total, cancelled_at, customers(name)').order('created_at', { ascending: false }).limit(8).returns<Recent[]>(),
  ])

  const steps = [
    { done: !!settings?.gstin && settings.business_name !== 'My Business', href: '/settings', title: 'Add your business details', why: 'Name, GSTIN and address print at the top of every document.' },
    { done: (products ?? 0) > 0, href: '/products', title: 'Add a product', why: 'Name, HSN code, GST rate and list price. You can change the price on any document.' },
    { done: (customers ?? 0) > 0, href: '/customers', title: 'Add a customer', why: 'Their GSTIN decides whether the invoice carries CGST and SGST or IGST.' },
    { done: (invoices ?? 0) > 0, href: '/invoices/new', title: 'Make your first invoice', why: 'Pick the customer, add lines, and print or save it as a PDF.' },
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
                <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${s.done ? 'bg-leaf text-white' : s === firstOpen ? 'bg-brand text-white' : 'border border-line'}`}>{s.done ? '✓' : i + 1}</span>
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

      {recent && recent.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Recent documents</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className={`border-t border-line first:border-t-0 hover:bg-tint/60 ${d.cancelled_at ? 'text-ink-soft' : ''}`}>
                    <td className="px-4 py-2 text-ink-soft">{KINDS[d.kind].label}</td>
                    <td className="px-4 py-2"><Link href={`${KINDS[d.kind].path}/${d.id}`} className="font-medium text-brand-deep hover:underline">{d.number}</Link>{d.cancelled_at && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Cancelled</span>}</td>
                    <td className="px-4 py-2">{d.customers?.name}</td>
                    <td className="px-4 py-2 text-ink-soft">{formatDate(d.date)}</td>
                    <td className="px-4 py-2 text-right">{KINDS[d.kind].money ? inr(d.total) : ''}</td>
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
