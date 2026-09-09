import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { DeleteButton } from '@/components/delete-button'
import { ProductForm } from '../product-form'
import { deleteProduct } from '../actions'

export default async function EditProductPage({ params }: PageProps<'/products/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single<Product>()
  if (!product) notFound()
  return (
    <>
      <Link href="/products" className="text-sm text-ink-soft hover:text-ink">← All products</Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold">{product.name}</h1>
      <p className="mb-5 text-sm text-ink-soft">Changes apply to new documents only. Documents already made keep the old price.</p>
      <ProductForm product={product} />
      <div className="mt-4"><DeleteButton action={deleteProduct.bind(null, product.id)} label="product" /></div>
    </>
  )
}
