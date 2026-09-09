import { PartyEditPage } from '@/components/party/pages'
export default async function Page({ params }: PageProps<'/vendors/[id]'>) {
  const { id } = await params
  return <PartyEditPage table="vendors" id={id} />
}
