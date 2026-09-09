import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Settings } from '@/lib/types'
import { DocumentView } from './view'

export async function DocumentPage({ kind, id }: { kind: Kind; id: string }) {
  const supabase = await createClient()
  const [{ data: doc }, { data: settings }] = await Promise.all([
    // source:source_id(...) follows the self-referencing FK to the quotation or invoice this came from.
    supabase.from('invoices').select('*, customers(*), invoice_items(*), source:source_id(number, kind)').eq('id', id)
      .single<Invoice & { customers: Customer; invoice_items: InvoiceItem[]; source: { number: string; kind: Kind } | null }>(),
    supabase.from('settings').select('*').single<Settings>(),
  ])
  if (!doc || !settings || doc.kind !== kind) notFound()
  return <DocumentView doc={doc} settings={settings} />
}
