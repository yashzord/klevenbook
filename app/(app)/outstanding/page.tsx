import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { sumPaid } from '@/lib/payments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { Stat } from '@/components/stat'
import { PrintButton } from '@/components/documents/print-button'

export const metadata: Metadata = { title: 'Outstanding' }

type Row = {
  id: string; number: string; date: string; due_date: string | null; total: string
  customers: { id: string; name: string; phone: string | null } | null
  vendors: { id: string; name: string; phone: string | null } | null
  payments: { amount: string }[] | null
}

const SIDES = {
  customers: { kind: 'invoice', path: '/invoices', title: 'Customers owe you', paid: 'Received', empty: 'Nobody owes you anything. Every invoice is paid.' },
  vendors: { kind: 'purchase', path: '/purchases', title: 'You owe vendors', paid: 'Paid', empty: 'You owe no vendor anything. Every purchase bill is paid.' },
} as const
type Side = keyof typeof SIDES

// Unpaid balances grouped by name, oldest first. Cancelled documents owe nothing and are left out.
export default async function OutstandingPage({ searchParams }: PageProps<'/outstanding'>) {
  const { side: raw } = await searchParams
  const side: Side = raw === 'vendors' ? 'vendors' : 'customers'
  const cfg = SIDES[side]
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('id, number, date, due_date, total, customers(id, name, phone), vendors(id, name, phone), payments(amount)')
    .eq('kind', cfg.kind).is('cancelled_at', null)
    .order('date').order('number')
    .returns<Row[]>()
  if (error) throw error

  const today = new Date().toISOString().slice(0, 10)
  const groups = new Map<string, { name: string; phone: string | null; due: number; docs: (Row & { paid: number; due: number })[] }>()
  for (const r of data) {
    const party = r.customers ?? r.vendors
    if (!party) continue
    const paid = sumPaid(r.payments)
    const due = Math.round((Number(r.total) - paid) * 100) / 100
    if (due <= 0.005) continue
    const g = groups.get(party.id) ?? { name: party.name, phone: party.phone, due: 0, docs: [] }
    g.docs.push({ ...r, paid, due })
    g.due = Math.round((g.due + due) * 100) / 100
    groups.set(party.id, g)
  }
  const list = [...groups.values()].sort((a, b) => b.due - a.due)
  const grand = Math.round(list.reduce((s, g) => s + g.due, 0) * 100) / 100
  return (
    <>
      <PageHeader title="Outstanding" hint="Unpaid balances by name, largest first. Updated the moment a payment is recorded.">
        <PrintButton />
      </PageHeader>
      <nav className="no-print mb-5 inline-flex gap-1 rounded-lg bg-muted p-1" aria-label="Outstanding side">
        {(['customers', 'vendors'] as Side[]).map((k) => (
          <Button key={k} asChild size="sm" variant={side === k ? 'outline' : 'ghost'} className="capitalize"><Link href={`/outstanding?side=${k}`}>{k}</Link></Button>
        ))}
      </nav>

      <div className="mb-4 max-w-sm"><Stat label={cfg.title} value={inr(grand)} note={`${list.length} ${list.length === 1 ? 'name' : 'names'}`} /></div>

      {list.length === 0 ? (
        <Empty className="border"><EmptyHeader><EmptyTitle>All settled</EmptyTitle><EmptyDescription>{cfg.empty}</EmptyDescription></EmptyHeader></Empty>
      ) : (
        <div className="space-y-4">
          {list.map((g) => (
            <Card key={g.name + g.phone} className="break-inside-avoid gap-0 py-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-muted px-4 py-3">
                <p className="font-medium">{g.name}{g.phone && <span className="ml-2 text-sm font-normal text-muted-foreground">{g.phone}</span>}</p>
                <p className="font-heading font-semibold tabular-nums">{inr(g.due)}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Number</TableHead><TableHead className="px-4">Date</TableHead>
                    <TableHead className="hidden px-4 sm:table-cell">Pay by</TableHead><TableHead className="hidden px-4 text-right sm:table-cell">Total</TableHead>
                    <TableHead className="hidden px-4 text-right sm:table-cell">{cfg.paid}</TableHead><TableHead className="px-4 text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {g.docs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="px-4 py-3"><Link href={`${cfg.path}/${d.id}`} className="font-medium text-primary hover:underline">{d.number}</Link></TableCell>
                      <TableCell className="px-4">{formatDate(d.date)}</TableCell>
                      <TableCell className="hidden px-4 sm:table-cell">{d.due_date ? formatDate(d.due_date) : '–'}{d.due_date && d.due_date < today && <Badge variant="destructive" className="ml-2">Overdue</Badge>}</TableCell>
                      <TableCell className="hidden px-4 text-right tabular-nums sm:table-cell">{inr(d.total)}</TableCell>
                      <TableCell className="hidden px-4 text-right tabular-nums sm:table-cell">{inr(d.paid)}</TableCell>
                      <TableCell className="px-4 text-right font-medium tabular-nums">{inr(d.due)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
