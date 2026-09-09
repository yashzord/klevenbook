import type { Metadata } from 'next'
import { NewDocumentPage } from '@/components/documents/new-page'
export const metadata: Metadata = { title: 'New quotation' }
export default async function Page({ searchParams }: PageProps<'/quotations/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="quotation" from={typeof from === 'string' ? from : undefined} />
}
