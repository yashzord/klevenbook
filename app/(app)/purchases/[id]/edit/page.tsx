import type { Metadata } from 'next'
import { EditDocumentPage } from '@/components/documents/edit-page'
export const metadata: Metadata = { title: 'Edit purchase bill' }
export default async function Page({ params }: PageProps<'/purchases/[id]/edit'>) {
  const { id } = await params
  return <EditDocumentPage kind="purchase" id={id} />
}
