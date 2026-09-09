import { NewDocumentPage } from '@/components/documents/new-page'
export default async function Page({ searchParams }: PageProps<'/quotations/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="quotation" from={typeof from === 'string' ? from : undefined} />
}
