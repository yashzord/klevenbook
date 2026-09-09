import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Link href="/invoices/new" className="rounded bg-slate-900 px-3 py-2 text-white">New invoice</Link>
      </div>
      <table className="w-full bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left"><tr><th className="p-2">Number</th><th className="p-2">Date</th><th className="p-2">Customer</th><th className="p-2 text-right">Total</th></tr></thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-2"><Link href={`/invoices/${inv.id}`} className="text-blue-700 underline">{inv.number}</Link></td>
              <td className="p-2">{inv.date}</td>
              <td className="p-2">{inv.customers?.name}</td>
              <td className="p-2 text-right">{inr(inv.total)}</td>
            </tr>
          ))}
          {invoices.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={4}>No invoices yet.</td></tr>}
        </tbody>
      </table>
    </>
  )
}
