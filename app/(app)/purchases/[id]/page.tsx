import type { Metadata } from 'next'
import { DocumentPage } from '@/components/documents/view-page'
export const metadata: Metadata = { title: 'Purchase bill' }
export default async function Page({ params }: PageProps<'/purchases/[id]'>) {
  const { id } = await params
  return <DocumentPage kind="purchase" id={id} />
}
