import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'
import type { Customer, Vendor } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteButton } from '@/components/delete-button'
import { PageHeader } from '@/components/page-header'
import { PartyForm } from './form'
import { deleteParty, setHidden, type PartyTable } from './actions'

const COPY: Record<PartyTable, { title: string; hint: string; path: string; noun: string }> = {
  customers: { title: 'Customers', hint: 'Who you sell to. Their name, address and GSTIN print on every document.', path: '/customers', noun: 'customer' },
  vendors: { title: 'Vendors', hint: 'Who you buy from, with their bank details. Their bills go under Purchase bills.', path: '/vendors', noun: 'vendor' },
}

export async function PartyListPage({ table }: { table: PartyTable }) {
  const c = COPY[table]
  const supabase = await createClient()
  const { data, error } = await supabase.from(table).select('*').order('hidden').order('name').returns<Customer[]>()
  if (error) throw error
  return (
    <>
      <PageHeader title={c.title} hint={c.hint} />
      <Card>
        <CardHeader>
          <CardTitle>Add a {c.noun}</CardTitle>
          <CardDescription>Type the GSTIN first if they have one; it fills in the state.</CardDescription>
        </CardHeader>
        <CardContent><PartyForm table={table} /></CardContent>
      </Card>
      <Card className="mt-6 py-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="px-4">Name</TableHead><TableHead className="px-4">GSTIN</TableHead>
              <TableHead className="hidden px-4 md:table-cell">State</TableHead><TableHead className="hidden px-4 md:table-cell">Phone</TableHead>
              <TableHead className="px-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id} className={p.hidden ? 'text-muted-foreground' : ''}>
                <TableCell className="px-4 whitespace-normal">
                  <Link href={`${c.path}/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link>
                  {p.hidden && <Badge variant="secondary" className="ml-2">Hidden</Badge>}
                </TableCell>
                <TableCell className="px-4">{p.gstin ?? <span className="text-muted-foreground">Unregistered</span>}</TableCell>
                <TableCell className="hidden px-4 md:table-cell">{STATES[p.state_code]}</TableCell>
                <TableCell className="hidden px-4 md:table-cell">{p.phone}</TableCell>
                <TableCell className="px-2 py-1.5">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm"><Link href={`${c.path}/${p.id}`}><Pencil /> Edit</Link></Button>
                    <form action={setHidden.bind(null, table, p.id, !p.hidden)}>
                      <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">{p.hidden ? <><Eye /> Show</> : <><EyeOff /> Hide</>}</Button>
                    </form>
                    <DeleteButton action={deleteParty.bind(null, table, p.id)} label={c.noun} compact />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No {c.title.toLowerCase()} yet. Add your first one above.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

export async function PartyEditPage({ table, id }: { table: PartyTable; id: string }) {
  const c = COPY[table]
  const supabase = await createClient()
  const { data: party } = await supabase.from(table).select('*').eq('id', id).single<Vendor>()
  if (!party) notFound()
  return (
    <>
      <Button asChild variant="ghost" className="-ml-3 mb-2 text-muted-foreground"><Link href={c.path}><ArrowLeft /> All {c.title.toLowerCase()}</Link></Button>
      <PageHeader title={party.name} hint="Changes show on new documents. Documents already made keep the old details.">
        <DeleteButton action={deleteParty.bind(null, table, party.id)} label={c.noun} />
      </PageHeader>
      <Card><CardContent><PartyForm table={table} party={party} /></CardContent></Card>
    </>
  )
}
