import type { Metadata } from 'next'
import { DocumentPage } from '@/components/documents/view-page'
export const metadata: Metadata = { title: 'Invoice' }
export default async function Page({ params, searchParams }: PageProps<'/invoices/[id]'>) {
  const { id } = await params
  const { copy } = await searchParams
  return <DocumentPage kind="invoice" id={id} copy={typeof copy === 'string' ? copy : undefined} />
}
