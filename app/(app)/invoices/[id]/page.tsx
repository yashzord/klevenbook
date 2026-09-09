import { DocumentPage } from '@/components/documents/view-page'
export default async function Page({ params }: PageProps<'/invoices/[id]'>) {
  const { id } = await params
  return <DocumentPage kind="invoice" id={id} />
}
