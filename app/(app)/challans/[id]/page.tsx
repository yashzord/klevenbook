import { DocumentPage } from '@/components/documents/view-page'
export default async function Page({ params }: PageProps<'/challans/[id]'>) {
  const { id } = await params
  return <DocumentPage kind="challan" id={id} />
}
