import type { Metadata } from 'next'
import { EditDocumentPage } from '@/components/documents/edit-page'
export const metadata: Metadata = { title: 'Edit delivery challan' }
export default async function Page({ params }: PageProps<'/challans/[id]/edit'>) {
  const { id } = await params
  return <EditDocumentPage kind="challan" id={id} />
}
