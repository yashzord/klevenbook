import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Product, Settings } from '@/lib/types'
import { IconArrowLeft } from '@/components/icons'
import { DocumentEditor } from './editor'

export async function EditDocumentPage({ kind, id }: { kind: Kind; id: string }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const [{ data: doc }, { data: parties }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('invoices').select('*, invoice_items(*)').eq('id', id).single<Invoice & { invoice_items: InvoiceItem[] }>(),
    supabase.from(cfg.party === 'vendor' ? 'vendors' : 'customers').select('*').order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
    supabase.from('settings').select('state_code').single<Pick<Settings, 'state_code'>>(),
  ])
  if (!doc || doc.kind !== kind || !parties || !products) notFound()

  const back = <Link href={`${cfg.path}/${doc.id}`} className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><IconArrowLeft /> Back to {doc.number}</Link>
  if (doc.cancelled_at) {
    return (
      <>
        {back}
        <p className="mt-4 rounded-lg border border-line bg-paper p-6">{doc.number} is cancelled, so it can no longer be edited. Make a new {cfg.label.toLowerCase()} instead.</p>
      </>
    )
  }

  return (
    <>
      {back}
      <h1 className="mb-1 mt-2 text-2xl font-semibold">Edit {doc.number}</h1>
      <p className="mb-5 text-sm text-ink-soft">The number, share link and recorded payments stay the same. Everything else can change.</p>
      <DocumentEditor
        kind={kind}
        parties={parties}
        products={products}
        sellerState={settings?.state_code ?? '36'}
        prefill={{
          party_id: doc.customer_id ?? doc.vendor_id ?? '',
          source_id: '',
          source_number: '',
          reference: doc.reference ?? '',
          rows: doc.invoice_items.filter((i) => i.product_id).map((i) => ({ product_id: i.product_id!, qty: String(Number(i.qty)), rate: String(Number(i.rate)), batch: i.batch ?? '' })),
        }}
        existing={{ id: doc.id, number: doc.number, date: doc.date, valid_until: doc.valid_until, eway_bill: doc.eway_bill, packages: doc.packages, notes: doc.notes }}
      />
    </>
  )
}
