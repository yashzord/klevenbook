import type { Metadata } from 'next'
import { EditDocumentPage } from '@/components/documents/edit-page'
export const metadata: Metadata = { title: 'Edit quotation' }
export default async function Page({ params }: PageProps<'/quotations/[id]/edit'>) {
  const { id } = await params
  return <EditDocumentPage kind="quotation" id={id} />
}
