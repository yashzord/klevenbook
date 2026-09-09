import type { Metadata } from 'next'
import { PartyListPage } from '@/components/party/pages'
export const metadata: Metadata = { title: 'Vendors' }
export default function Page() { return <PartyListPage table="vendors" /> }
