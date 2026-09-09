import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import type { Product } from '@/lib/types'
import { ProductForm } from './product-form'

export const metadata: Metadata = { title: 'Products' }
export default async function ProductsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').order('name').returns<Product[]>()
  if (error) throw error

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Products</h1>
      <p className="mb-5 text-sm text-ink-soft">What you sell. The list price fills in on documents and can be changed per line. Click a name to edit it.</p>
      <ProductForm />
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-ink-soft"><tr><th className="px-4 py-2 font-medium">Name</th><th className="px-4 py-2 font-medium">HSN</th><th className="px-4 py-2 font-medium">Unit</th><th className="px-4 py-2 text-right font-medium">List price</th><th className="px-4 py-2 text-right font-medium">GST %</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t border-line hover:bg-tint/60">
                <td className="px-4 py-2"><Link href={`/products/${p.id}`} className="font-medium text-brand-deep hover:underline">{p.name}</Link></td><td className="px-4 py-2">{p.hsn}</td><td className="px-4 py-2">{p.unit}</td>
                <td className="px-4 py-2 text-right">{inr(p.price)}</td><td className="px-4 py-2 text-right">{Number(p.gst_rate)}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td className="px-4 py-6 text-center text-ink-soft" colSpan={5}>No products yet. Add your first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
