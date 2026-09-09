import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentView } from '@/components/documents/view'
import type { Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Settings } from '@/lib/types'

type Shared = { doc: Invoice; customer: Customer; items: InvoiceItem[]; source: { number: string; kind: Kind } | null; settings: Settings }

// Public, no login. The token is the only key; the database function returns nothing without a match.
export default async function SharedDocumentPage({ params }: PageProps<'/share/[token]'>) {
  const { token } = await params
  if (!/^[0-9a-f-]{36}$/.test(token)) notFound()
  const supabase = await createClient()
  const { data: raw } = await supabase.rpc('shared_document', { token })
  const data = raw as Shared | null // scalar jsonb comes back as the value itself
  if (!data?.doc) notFound()
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <p className="no-print mb-4 flex items-center gap-2 text-sm text-ink-soft"><Image src="/icon.png" alt="" width={20} height={20} /> Shared by {data.settings.business_name}</p>
      <DocumentView doc={{ ...data.doc, customers: data.customer, invoice_items: data.items, source: data.source }} settings={data.settings} />
    </main>
  )
}
