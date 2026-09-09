import type { Metadata } from 'next'
import { NewDocumentPage } from '@/components/documents/new-page'
export const metadata: Metadata = { title: 'New invoice' }
export default async function Page({ searchParams }: PageProps<'/invoices/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="invoice" from={typeof from === 'string' ? from : undefined} />
}
