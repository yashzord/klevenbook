import type { Metadata } from 'next'
import { DocumentList } from '@/components/documents/list'
export const metadata: Metadata = { title: 'Quotations' }
export default function Page() { return <DocumentList kind="quotation" /> }
