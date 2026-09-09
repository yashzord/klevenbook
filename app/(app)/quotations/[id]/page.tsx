import { DocumentPage } from '@/components/documents/view-page'
export default async function Page({ params }: PageProps<'/quotations/[id]'>) {
  const { id } = await params
  return <DocumentPage kind="quotation" id={id} />
}
