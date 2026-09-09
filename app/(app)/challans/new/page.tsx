import { NewDocumentPage } from '@/components/documents/new-page'
export default async function Page({ searchParams }: PageProps<'/challans/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="challan" from={typeof from === 'string' ? from : undefined} />
}
