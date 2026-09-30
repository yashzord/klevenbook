import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, PAYABLE, type Kind } from '@/lib/documents'
import { payStatus, STATUS_LABEL, STATUS_VARIANT, sumPaid } from '@/lib/payments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { ExportForm } from './export-form'

const HINT: Record<Kind, string> = {
  invoice: 'Tax documents for sales. Download the CSV at month end.',
  quotation: 'Price offers. Open one and press Make invoice when the customer confirms.',
  challan: 'Travels with the goods. Start one from an invoice so the lines match.',
  purchase: 'Bills from your vendors, entered as they arrive. Download the CSV for input tax credit.',
}

type Row = { id: string; number: string; date: string; total: string; packages: number | null; cancelled_at: string | null; customers: { name: string } | null; vendors: { name: string } | null; payments: { amount: string }[] | null }

export async function DocumentList({ kind }: { kind: Kind }) {
  const cfg = KINDS[kind]
  const payable = PAYABLE.includes(kind)
  const supabase = await createClient()
  const { data: docs, error } = await supabase
    .from('invoices')
    .select(`id, number, date, total, packages, cancelled_at, ${cfg.party === 'vendor' ? 'vendors(name)' : 'customers(name)'}${payable ? ', payments(amount)' : ''}`)
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .returns<Row[]>()
  if (error) throw error

  return (
    <>
      <PageHeader title={cfg.plural} hint={HINT[kind]}>
        <Button asChild><Link href={`${cfg.path}/new`}><Plus /> New {cfg.label.toLowerCase()}</Link></Button>
      </PageHeader>
      {docs.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No {cfg.plural.toLowerCase()} yet</EmptyTitle>
            <EmptyDescription>
              {kind === 'challan' ? 'Open an invoice and choose Make delivery challan, or start one from scratch.' : kind === 'purchase' ? 'Add a vendor first, then enter their bill here.' : 'You need a product and a customer first, then create one.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button asChild variant="outline" size="sm"><Link href="/products">Products</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href={cfg.party === 'vendor' ? '/vendors' : '/customers'}>{cfg.party === 'vendor' ? 'Vendors' : 'Customers'}</Link></Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {(kind === 'invoice' || kind === 'purchase') && <ExportForm kind={kind} />}
          <Card className="py-0">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="px-4">Number</TableHead>
                  <TableHead className="hidden px-4 sm:table-cell">Date</TableHead>
                  <TableHead className="px-4">{cfg.party === 'vendor' ? 'Vendor' : 'Customer'}</TableHead>
                  <TableHead className="px-4 text-right">{cfg.money ? 'Total' : 'Packages'}</TableHead>
                  {payable && <TableHead className="px-4">Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => {
                  const st = payStatus(d.total, sumPaid(d.payments), !!d.cancelled_at)
                  return (
                    <TableRow key={d.id} className={d.cancelled_at ? 'text-muted-foreground' : ''}>
                      <TableCell className="px-4 py-3">
                        <Link href={`${cfg.path}/${d.id}`} className="font-medium text-primary hover:underline">{d.number}</Link>
                        {d.cancelled_at && !payable && <Badge variant="destructive" className="ml-2">Cancelled</Badge>}
                      </TableCell>
                      <TableCell className="hidden px-4 sm:table-cell">{formatDate(d.date)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{(d.customers ?? d.vendors)?.name}</TableCell>
                      <TableCell className="px-4 text-right tabular-nums">{cfg.money ? inr(d.total) : d.packages ?? '–'}</TableCell>
                      {payable && <TableCell className="px-4"><Badge variant={STATUS_VARIANT[st]}>{STATUS_LABEL[st]}</Badge></TableCell>}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </>
  )
}
