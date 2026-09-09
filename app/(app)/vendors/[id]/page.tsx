import type { Metadata } from 'next'
import { PartyEditPage } from '@/components/party/pages'
export const metadata: Metadata = { title: 'Edit vendor' }
export default async function Page({ params }: PageProps<'/vendors/[id]'>) {
  const { id } = await params
  return <PartyEditPage table="vendors" id={id} />
}
