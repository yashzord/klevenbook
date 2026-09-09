import type { Metadata } from 'next'
import { PartyListPage } from '@/components/party/pages'
export const metadata: Metadata = { title: 'Customers' }
export default function Page() { return <PartyListPage table="customers" /> }
