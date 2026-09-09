import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Customer, Product, Settings } from '@/lib/types'
import { InvoiceEditor } from './invoice-editor'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const [{ data: customers }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('customers').select('*').order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
    supabase.from('settings').select('state_code').single<Pick<Settings, 'state_code'>>(),
  ])
  if (!customers?.length || !products?.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
        <p className="font-medium">Before the first invoice</p>
        <p className="mt-1 text-sm text-ink-soft">You need at least one product and one customer.</p>
        <div className="mt-4 flex justify-center gap-3 text-sm">
          {!products?.length && <Link href="/products" className="text-brand hover:underline">Add a product</Link>}
          {!customers?.length && <Link href="/customers" className="text-brand hover:underline">Add a customer</Link>}
        </div>
      </div>
    )
  }
  return (
    <>
      <h1 className="mb-5 text-2xl font-semibold">New invoice</h1>
      <InvoiceEditor customers={customers} products={products} sellerState={settings?.state_code ?? '36'} />
    </>
  )
}
