import { NewDocumentPage } from '@/components/documents/new-page'
export default async function Page({ searchParams }: PageProps<'/invoices/new'>) {
  const { from } = await searchParams
  return <NewDocumentPage kind="invoice" from={typeof from === 'string' ? from : undefined} />
}
