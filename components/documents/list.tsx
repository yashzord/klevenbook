import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, type Kind } from '@/lib/documents'
import { ExportForm } from './export-form'

type Row = { id: string; number: string; date: string; total: string; packages: number | null; customers: { name: string } | null }

export async function DocumentList({ kind }: { kind: Kind }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const { data: docs, error } = await supabase
    .from('invoices')
    .select('id, number, date, total, packages, customers(name)')
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .returns<Row[]>()
  if (error) throw error

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{cfg.plural}</h1>
        <div className="flex items-center gap-3">
          {kind === 'invoice' && docs.length > 0 && <ExportForm />}
          <Link href={`${cfg.path}/new`} className="rounded-md bg-leaf px-4 py-2 font-medium text-white transition hover:bg-leaf-deep">New {cfg.label.toLowerCase()}</Link>
        </div>
      </div>
      {docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
          <p className="font-medium">No {cfg.plural.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-ink-soft">
            {kind === 'challan' ? 'Open an invoice and choose Make delivery challan, or start one from scratch.' : 'You need a product and a customer first, then create one.'}
          </p>
          <div className="mt-4 flex justify-center gap-3 text-sm">
            <Link href="/products" className="text-brand hover:underline">Products</Link>
            <Link href="/customers" className="text-brand hover:underline">Customers</Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-tint text-left text-ink-soft">
              <tr><th className="px-4 py-2 font-medium">Number</th><th className="px-4 py-2 font-medium">Date</th><th className="px-4 py-2 font-medium">Customer</th><th className="px-4 py-2 text-right font-medium">{cfg.money ? 'Total' : 'Packages'}</th></tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t border-line transition hover:bg-tint/60">
                  <td className="px-4 py-2"><Link href={`${cfg.path}/${d.id}`} className="font-medium text-brand-deep hover:underline">{d.number}</Link></td>
                  <td className="px-4 py-2">{formatDate(d.date)}</td>
                  <td className="px-4 py-2">{d.customers?.name}</td>
                  <td className="px-4 py-2 text-right">{cfg.money ? inr(d.total) : d.packages ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
