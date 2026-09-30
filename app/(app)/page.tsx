import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, FileCheck2, ReceiptText, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { KINDS, type Kind } from '@/lib/documents'
import { sumPaid } from '@/lib/payments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { Stat } from '@/components/stat'

export const metadata: Metadata = { title: 'Home' }

type Open = { id: string; due_date: string | null; total: string; payments: { amount: string }[] | null }
type Recent = { id: string; kind: Kind; number: string; date: string; total: string; cancelled_at: string | null; customers: { name: string } | null; vendors: { name: string } | null }

const QUICK = [
  { kind: 'quotation', icon: FileCheck2, text: 'A price offer before the order. Turns into an invoice in one click.' },
  { kind: 'invoice', icon: ReceiptText, text: 'The tax document for a sale. GST is worked out per line.' },
  { kind: 'challan', icon: Truck, text: 'Goes with the goods. Quantities and batch numbers, no prices.' },
] as const

// Home: what is owed, what to set up next, quick actions, recent documents.
export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: settings }, { count: products }, { count: customers }, { count: invoices }, { count: paymentsCount }, { data: recent }, { data: open }, { data: openPurchases }] = await Promise.all([
    supabase.from('settings').select('business_name, gstin, bank_name, upi_id').single<{ business_name: string; gstin: string | null; bank_name: string | null; upi_id: string | null }>(),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('kind', 'invoice'),
    supabase.from('payments').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('id, kind, number, date, total, cancelled_at, customers(name), vendors(name)').order('created_at', { ascending: false }).limit(8).returns<Recent[]>(),
    supabase.from('invoices').select('id, due_date, total, payments(amount)').eq('kind', 'invoice').is('cancelled_at', null).returns<Open[]>(),
    supabase.from('invoices').select('id, due_date, total, payments(amount)').eq('kind', 'purchase').is('cancelled_at', null).returns<Open[]>(),
  ])
  const today = new Date().toISOString().slice(0, 10)
  const withDue = (rows: Open[] | null) => (rows ?? []).map((o) => ({ ...o, due: Math.round((Number(o.total) - sumPaid(o.payments)) * 100) / 100 })).filter((o) => o.due > 0.005)
  const sum = (rows: { due: number }[]) => Math.round(rows.reduce((s, o) => s + o.due, 0) * 100) / 100
  const owed = withDue(open), owing = withDue(openPurchases)
  const overdue = owed.filter((o) => o.due_date && o.due_date < today)

  const steps = [
    { done: !!settings?.gstin && settings.business_name !== 'My Business', href: '/settings', title: 'Add your business details', why: 'Name, GSTIN and address print at the top of every document.' },
    { done: !!(settings?.bank_name || settings?.upi_id), href: '/settings', title: 'Add your bank details', why: 'Printed on invoices and quotations so customers can pay straight from the PDF.' },
    { done: (products ?? 0) > 0, href: '/products', title: 'Add a product', why: 'Name, HSN code, GST rate and list price. You can change the price on any document.' },
    { done: (customers ?? 0) > 0, href: '/customers', title: 'Add a customer', why: 'Their name, address and GSTIN print on every invoice.' },
    { done: (invoices ?? 0) > 0, href: '/invoices/new', title: 'Make your first invoice', why: 'Pick the customer, add lines, and print or save it as a PDF.' },
    { done: (paymentsCount ?? 0) > 0, href: '/invoices', title: 'Record a payment', why: 'Open an invoice and enter what came in. Outstanding then shows who still owes you.' },
  ]
  const remaining = steps.filter((s) => !s.done).length
  const firstOpen = steps.find((s) => !s.done)
  const stats = [
    { label: 'Customers owe you', value: inr(sum(owed)), note: `${owed.length} unpaid ${owed.length === 1 ? 'invoice' : 'invoices'}`, href: '/outstanding', tone: owed.length ? 'text-foreground' : 'text-muted-foreground' },
    { label: 'Overdue', value: inr(sum(overdue)), note: overdue.length ? `${overdue.length} past the pay-by date` : 'Nothing past its pay-by date', href: '/outstanding', tone: overdue.length ? 'text-destructive' : 'text-muted-foreground' },
    { label: 'You owe vendors', value: inr(sum(owing)), note: `${owing.length} unpaid ${owing.length === 1 ? 'bill' : 'bills'}`, href: '/outstanding?side=vendors', tone: owing.length ? 'text-foreground' : 'text-muted-foreground' },
  ]

  return (
    <>
      <PageHeader title={`Welcome, ${settings?.business_name ?? ''}`} hint={remaining === 0 ? 'Everything is set up.' : `${remaining} of ${steps.length} setup steps left.`}>
        <Button asChild><Link href="/invoices/new"><ReceiptText /> New invoice</Link></Button>
      </PageHeader>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </section>

      {remaining > 0 && (
        <Card className="mb-6 gap-0 py-0">
          <CardHeader className="border-b py-4"><CardTitle>Getting started</CardTitle><CardDescription>Each step ticks itself off as you do it.</CardDescription></CardHeader>
          <ol className="divide-y">
            {steps.map((s, i) => (
              <li key={s.title} className={`flex items-center gap-4 px-6 py-3 ${s.done ? 'text-muted-foreground' : ''}`}>
                <span aria-hidden className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${s.done ? 'bg-success text-success-foreground' : s === firstOpen ? 'bg-primary text-primary-foreground' : 'border'}`}>{s.done ? <Check className="size-3.5" /> : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={s.done ? 'line-through' : 'font-medium'}>{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.why}</p>
                </div>
                {!s.done && <Button asChild size="sm" variant={s === firstOpen ? 'default' : 'ghost'} className="shrink-0"><Link href={s.href}>{s === firstOpen ? 'Do this next' : 'Open'}</Link></Button>}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {QUICK.map(({ kind, icon: Icon, text }) => (
          <Link key={kind} href={`${KINDS[kind].path}/new`} className="group rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 transition hover:ring-primary/40">
            <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="size-5" /></span>
            <p className="font-heading font-medium">New {KINDS[kind].label.toLowerCase()}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </Link>
        ))}
      </section>

      {recent && recent.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4"><CardTitle>Recent documents</CardTitle></CardHeader>
          <Table>
            <TableBody>
              {recent.map((d) => (
                <TableRow key={d.id} className={d.cancelled_at ? 'text-muted-foreground' : ''}>
                  <TableCell className="hidden px-6 text-muted-foreground sm:table-cell">{KINDS[d.kind].label}</TableCell>
                  <TableCell className="px-6 py-3"><Link href={`${KINDS[d.kind].path}/${d.id}`} className="font-medium text-primary hover:underline">{d.number}</Link>{d.cancelled_at && <Badge variant="destructive" className="ml-2">Cancelled</Badge>}</TableCell>
                  <TableCell className="px-6 whitespace-normal">{(d.customers ?? d.vendors)?.name}</TableCell>
                  <TableCell className="hidden px-6 text-muted-foreground sm:table-cell">{formatDate(d.date)}</TableCell>
                  <TableCell className="px-6 text-right tabular-nums">{KINDS[d.kind].money ? inr(d.total) : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  )
}
