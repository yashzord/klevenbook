import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import type { Product } from '@/lib/types'
import { addProduct } from './actions'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  const products = data as Product[]

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Products</h1>
      <form action={addProduct} className="mb-6 grid grid-cols-6 gap-2 rounded bg-white p-4 shadow">
        <input name="name" required placeholder="Product name" className="col-span-2 rounded border p-2" />
        <input name="hsn" placeholder="HSN" className="rounded border p-2" />
        <input name="unit" placeholder="Unit (pcs)" className="rounded border p-2" />
        <input name="price" type="number" step="0.01" min="0" required placeholder="Price" className="rounded border p-2" />
        <input name="gst_rate" type="number" step="0.01" min="0" max="100" required placeholder="GST %" className="rounded border p-2" />
        <button className="col-span-6 rounded bg-slate-900 p-2 text-white">Add product</button>
      </form>
      <table className="w-full bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left"><tr><th className="p-2">Name</th><th className="p-2">HSN</th><th className="p-2">Unit</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">GST %</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td><td className="p-2">{p.hsn}</td><td className="p-2">{p.unit}</td>
              <td className="p-2 text-right">{inr(p.price)}</td><td className="p-2 text-right">{Number(p.gst_rate)}</td>
            </tr>
          ))}
          {products.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={5}>No products yet.</td></tr>}
        </tbody>
      </table>
    </>
  )
}
