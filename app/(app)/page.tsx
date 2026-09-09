import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, number, date, total, customers(name)')
    .order('created_at', { ascending: false })
    .returns<{ id: string; number: string; date: string; total: string; customers: { name: string } | null }[]>()
  if (error) throw error

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/invoices/new" className="rounded-md bg-leaf px-4 py-2 font-medium text-white transition hover:bg-leaf-deep">New invoice</Link>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
          <p className="font-medium">No invoices yet</p>
          <p className="mt-1 text-sm text-ink-soft">Add a product and a customer first, then create your first invoice.</p>
          <div className="mt-4 flex justify-center gap-3 text-sm">
            <Link href="/products" className="text-brand underline-offset-2 hover:underline">Add products</Link>
            <Link href="/customers" className="text-brand underline-offset-2 hover:underline">Add customers</Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-tint text-left text-ink-soft"><tr><th className="px-4 py-2 font-medium">Number</th><th className="px-4 py-2 font-medium">Date</th><th className="px-4 py-2 font-medium">Customer</th><th className="px-4 py-2 text-right font-medium">Total</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-line transition hover:bg-tint/60">
                  <td className="px-4 py-2"><Link href={`/invoices/${inv.id}`} className="font-medium text-brand-deep hover:underline">{inv.number}</Link></td>
                  <td className="px-4 py-2">{formatDate(inv.date)}</td>
                  <td className="px-4 py-2">{inv.customers?.name}</td>
                  <td className="px-4 py-2 text-right">{inr(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
