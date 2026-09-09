import { DocumentPage } from '@/components/documents/view-page'
export default async function Page({ params }: PageProps<'/purchases/[id]'>) {
  const { id } = await params
  return <DocumentPage kind="purchase" id={id} />
}
