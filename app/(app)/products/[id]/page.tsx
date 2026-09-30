import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeleteButton } from '@/components/delete-button'
import { PageHeader } from '@/components/page-header'
import { ProductForm } from '../product-form'
import { deleteProduct } from '../actions'

export const metadata: Metadata = { title: 'Edit product' }
export default async function EditProductPage({ params }: PageProps<'/products/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single<Product>()
  if (!product) notFound()
  return (
    <>
      <Button asChild variant="ghost" className="-ml-3 mb-2 text-muted-foreground"><Link href="/products"><ArrowLeft /> All products</Link></Button>
      <PageHeader title={product.name} hint="Changes apply to new documents only. Documents already made keep the old price.">
        <DeleteButton action={deleteProduct.bind(null, product.id)} label="product" />
      </PageHeader>
      <Card><CardContent><ProductForm product={product} /></CardContent></Card>
    </>
  )
}
