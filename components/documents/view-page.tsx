import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Payment, Settings } from '@/lib/types'
import { DocumentView } from './view'
import { PaymentsPanel } from './payments'

export async function DocumentPage({ kind, id }: { kind: Kind; id: string }) {
  const supabase = await createClient()
  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`
  const [{ data: doc }, { data: settings }, { data: payments }] = await Promise.all([
    // source:source_id(...) follows the self-referencing FK to the quotation or invoice this came from.
    supabase.from('invoices').select('*, customers(*), invoice_items(*), source:source_id(number, kind)').eq('id', id)
      .single<Invoice & { share_token: string; customers: Customer; invoice_items: InvoiceItem[]; source: { number: string; kind: Kind } | null }>(),
    supabase.from('settings').select('*').single<Settings>(),
    kind === 'invoice' ? supabase.from('payments').select('*').eq('invoice_id', id).order('date').returns<Payment[]>() : Promise.resolve({ data: null }),
  ])
  if (!doc || !settings || doc.kind !== kind) notFound()
  return (
    <>
      <DocumentView doc={doc} settings={settings} shareUrl={`${origin}/share/${doc.share_token}`} />
      {kind === 'invoice' && <PaymentsPanel invoiceId={doc.id} total={doc.total} cancelled={!!doc.cancelled_at} payments={payments ?? []} />}
    </>
  )
}
