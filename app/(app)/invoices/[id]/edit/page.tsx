import type { Metadata } from 'next'
import { EditDocumentPage } from '@/components/documents/edit-page'
export const metadata: Metadata = { title: 'Edit invoice' }
export default async function Page({ params }: PageProps<'/invoices/[id]/edit'>) {
  const { id } = await params
  return <EditDocumentPage kind="invoice" id={id} />
}
