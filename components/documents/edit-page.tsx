import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Product, Settings } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { DocumentEditor } from './editor'

export async function EditDocumentPage({ kind, id }: { kind: Kind; id: string }) {
  const cfg = KINDS[kind]
  const supabase = await createClient()
  const [{ data: doc }, { data: parties }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('invoices').select('*, invoice_items(*)').eq('id', id).single<Invoice & { invoice_items: InvoiceItem[] }>(),
    supabase.from(cfg.party === 'vendor' ? 'vendors' : 'customers').select('*').order('name').returns<Customer[]>(),
    supabase.from('products').select('*').order('name').returns<Product[]>(),
    supabase.from('settings').select('*').single<Settings>(),
  ])
  if (!doc || doc.kind !== kind || !parties || !products || !settings) notFound()

  const back = <Button asChild variant="ghost" className="-ml-3 mb-2 text-muted-foreground"><Link href={`${cfg.path}/${doc.id}`}><ArrowLeft /> Back to {doc.number}</Link></Button>
  if (doc.cancelled_at) {
    return (
      <>
        {back}
        <p className="rounded-xl border p-6">{doc.number} is cancelled, so it can no longer be edited. Make a new {cfg.label.toLowerCase()} instead.</p>
      </>
    )
  }

  return (
    <>
      {back}
      <PageHeader title={`Edit ${doc.number}`} hint="The number, share link and recorded payments stay the same. Everything else can change." />
      <DocumentEditor
        kind={kind}
        parties={parties.filter((p) => !p.hidden || p.id === (doc.customer_id ?? doc.vendor_id))}
        products={products}
        settings={settings}
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
