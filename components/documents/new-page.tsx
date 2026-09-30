import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KINDS, SOURCE_KIND, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Product, Settings } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { PageHeader } from '@/components/page-header'
import { DocumentEditor, type Prefill } from './editor'

export async function NewDocumentPage({ kind, from }: { kind: Kind; from?: string }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const [{ data: parties }, { data: products }, { data: settings }, { data: source }] = await Promise.all([
    supabase.from(cfg.party === 'vendor' ? 'vendors' : 'customers').select('*').eq('hidden', false).order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
    supabase.from('settings').select('state_code').single<Pick<Settings, 'state_code'>>(),
    from ? supabase.from('invoices').select('*, invoice_items(*)').eq('id', from).single<Invoice & { invoice_items: InvoiceItem[] }>() : Promise.resolve({ data: null }),
  ])
  if (from && (!source || source.kind !== SOURCE_KIND[kind])) notFound()

  if (!parties?.length || !products?.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Before the first {cfg.label.toLowerCase()}</EmptyTitle>
          <EmptyDescription>You need at least one product and one {cfg.party}.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          {!products?.length && <Button asChild variant="outline" size="sm"><Link href="/products">Add a product</Link></Button>}
          {!parties?.length && <Button asChild variant="outline" size="sm"><Link href={cfg.party === 'vendor' ? '/vendors' : '/customers'}>Add a {cfg.party}</Link></Button>}
        </EmptyContent>
      </Empty>
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
      <PageHeader title={`New ${cfg.label.toLowerCase()}`} />
      <DocumentEditor kind={kind} parties={parties} products={products} sellerState={settings?.state_code ?? '36'} prefill={prefill} />
    </>
  )
}
