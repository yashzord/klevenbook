import { createClient } from '@/lib/supabase/server'
import { ROW_COUNT, type Customer, type Product } from '@/lib/types'
import { createInvoice } from './actions'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase.from('customers').select('*').order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
  ])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">New invoice</h1>
      <form action={createInvoice} className="space-y-4 rounded bg-white p-4 shadow">
        <div className="grid grid-cols-2 gap-2">
          <select name="customer_id" required className="rounded border p-2">
            <option value="">Select customer</option>
            {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="date" type="date" defaultValue={today} required className="rounded border p-2" />
        </div>
        <table className="w-full text-sm">
          <thead className="text-left"><tr><th className="p-1">Product</th><th className="p-1 w-24">Qty</th><th className="p-1 w-32">Rate (blank = list price)</th></tr></thead>
          <tbody>
            {Array.from({ length: ROW_COUNT }, (_, i) => (
              <tr key={i}>
                <td className="p-1">
                  <select name={`product_${i}`} className="w-full rounded border p-2">
                    <option value="">—</option>
                    {products?.map((p) => <option key={p.id} value={p.id}>{p.name} (₹{Number(p.price)}, {Number(p.gst_rate)}%)</option>)}
                  </select>
                </td>
                <td className="p-1"><input name={`qty_${i}`} type="number" step="any" min="0" className="w-full rounded border p-2" /></td>
                <td className="p-1"><input name={`rate_${i}`} type="number" step="0.01" min="0" className="w-full rounded border p-2" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <textarea name="notes" placeholder="Notes (optional)" className="w-full rounded border p-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Create invoice</button>
      </form>
    </>
  )
}
