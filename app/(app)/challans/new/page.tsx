import type { Metadata } from 'next'
import { NewDocumentPage } from '@/components/documents/new-page'
export const metadata: Metadata = { title: 'New delivery challan' }
export default async function Page({ searchParams }: PageProps<'/challans/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="challan" from={typeof from === 'string' ? from : undefined} />
}
