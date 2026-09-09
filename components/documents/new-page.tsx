import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KINDS, SOURCE_KIND, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Product, Settings } from '@/lib/types'
import { DocumentEditor, type Prefill } from './editor'

export async function NewDocumentPage({ kind, from }: { kind: Kind; from?: string }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const [{ data: parties }, { data: products }, { data: settings }, { data: source }] = await Promise.all([
    supabase.from(cfg.party === 'vendor' ? 'vendors' : 'customers').select('*').order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
    supabase.from('settings').select('state_code').single<Pick<Settings, 'state_code'>>(),
    from ? supabase.from('invoices').select('*, invoice_items(*)').eq('id', from).single<Invoice & { invoice_items: InvoiceItem[] }>() : Promise.resolve({ data: null }),
  ])
  if (from && (!source || source.kind !== SOURCE_KIND[kind])) notFound()

  if (!parties?.length || !products?.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-paper p-10 text-center">
        <p className="font-medium">Before the first {cfg.label.toLowerCase()}</p>
        <p className="mt-1 text-sm text-ink-soft">You need at least one product and one {cfg.party}.</p>
        <div className="mt-4 flex justify-center gap-3 text-sm">
          {!products?.length && <Link href="/products" className="text-brand hover:underline">Add a product</Link>}
          {!parties?.length && <Link href={cfg.party === 'vendor' ? '/vendors' : '/customers'} className="text-brand hover:underline">Add a {cfg.party}</Link>}
        </div>
      </div>
    )
  }

  const prefill: Prefill | undefined = source ? {
    party_id: source.customer_id ?? '',
    source_id: source.id,
    source_number: source.number,
    reference: source.reference ?? '',
    rows: source.invoice_items.filter((i) => i.product_id).map((i) => ({ product_id: i.product_id!, qty: String(Number(i.qty)), rate: String(Number(i.rate)), batch: i.batch ?? '' })),
  } : undefined

  return (
    <>
      <h1 className="mb-5 text-2xl font-semibold">New {cfg.label.toLowerCase()}</h1>
      <DocumentEditor kind={kind} parties={parties} products={products} sellerState={settings?.state_code ?? '36'} prefill={prefill} />
    </>
  )
}
