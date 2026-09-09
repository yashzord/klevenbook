import { PartyEditPage } from '@/components/party/pages'
export default async function Page({ params }: PageProps<'/customers/[id]'>) {
  const { id } = await params
  return <PartyEditPage table="customers" id={id} />
}
