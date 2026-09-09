import { NewDocumentPage } from '@/components/documents/new-page'
export default async function Page({ searchParams }: PageProps<'/purchases/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="purchase" from={typeof from === 'string' ? from : undefined} />
}
