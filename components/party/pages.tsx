import Link from 'next/link'
import { IconArrowLeft } from '@/components/icons'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'
import type { Customer } from '@/lib/types'
import { DeleteButton } from '@/components/delete-button'
import { PartyForm } from './form'
import { deleteParty, type PartyTable } from './actions'

const COPY: Record<PartyTable, { title: string; hint: string; path: string; noun: string }> = {
  customers: { title: 'Customers', hint: 'Who you sell to. The GSTIN decides whether an invoice carries CGST and SGST or IGST. Click a name to edit it.', path: '/customers', noun: 'customer' },
  vendors: { title: 'Vendors', hint: 'Who you buy from. Their bills go under Purchases so your CA can claim input tax. Click a name to edit it.', path: '/vendors', noun: 'vendor' },
}

export async function PartyListPage({ table }: { table: PartyTable }) {
  const c = COPY[table]
  const supabase = await createClient()
  const { data, error } = await supabase.from(table).select('*').order('name').returns<Customer[]>()
  if (error) throw error
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">{c.title}</h1>
      <p className="mb-5 text-sm text-ink-soft">{c.hint}</p>
      <PartyForm table={table} />
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-ink-soft"><tr><th className="px-4 py-2 font-medium">Name</th><th className="px-4 py-2 font-medium">GSTIN</th><th className="hidden px-4 py-2 font-medium sm:table-cell">State</th><th className="hidden px-4 py-2 font-medium sm:table-cell">Phone</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t border-line hover:bg-tint/60">
                <td className="px-4 py-2"><Link href={`${c.path}/${p.id}`} className="font-medium text-brand-deep hover:underline">{p.name}</Link></td>
                <td className="whitespace-nowrap px-4 py-2">{p.gstin ?? <span className="text-ink-soft">Unregistered</span>}</td>
                <td className="hidden px-4 py-2 sm:table-cell">{STATES[p.state_code]}</td><td className="hidden px-4 py-2 sm:table-cell">{p.phone}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td className="px-4 py-6 text-center text-ink-soft" colSpan={4}>No {c.title.toLowerCase()} yet. Add your first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

export async function PartyEditPage({ table, id }: { table: PartyTable; id: string }) {
  const c = COPY[table]
  const supabase = await createClient()
  const { data: party } = await supabase.from(table).select('*').eq('id', id).single<Customer>()
  if (!party) notFound()
  return (
    <>
      <Link href={c.path} className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><IconArrowLeft /> All {c.title.toLowerCase()}</Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold">{party.name}</h1>
      <p className="mb-5 text-sm text-ink-soft">Changes show on new documents. Documents already made keep the old details.</p>
      <PartyForm table={table} party={party} />
      <div className="mt-4"><DeleteButton action={deleteParty.bind(null, table, party.id)} label={c.noun} /></div>
    </>
  )
}
