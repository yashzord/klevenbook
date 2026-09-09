import type { Metadata } from 'next'
import { PartyEditPage } from '@/components/party/pages'
export const metadata: Metadata = { title: 'Edit customer' }
export default async function Page({ params }: PageProps<'/customers/[id]'>) {
  const { id } = await params
  return <PartyEditPage table="customers" id={id} />
}
