import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'
import type { Customer } from '@/lib/types'
import { CustomerForm } from './customer-form'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('customers').select('*').order('name').returns<Customer[]>()
  if (error) throw error

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Customers</h1>
      <p className="mb-5 text-sm text-ink-soft">Who you sell to. The GSTIN decides whether an invoice carries CGST and SGST or IGST. Click a name to edit it.</p>
      <CustomerForm />
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-tint text-left text-ink-soft"><tr><th className="px-4 py-2 font-medium">Name</th><th className="px-4 py-2 font-medium">GSTIN</th><th className="px-4 py-2 font-medium">State</th><th className="px-4 py-2 font-medium">Phone</th></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t border-line hover:bg-tint/60">
                <td className="px-4 py-2"><Link href={`/customers/${c.id}`} className="font-medium text-brand-deep hover:underline">{c.name}</Link></td><td className="px-4 py-2">{c.gstin ?? <span className="text-ink-soft">Unregistered</span>}</td>
                <td className="px-4 py-2">{STATES[c.state_code]}</td><td className="px-4 py-2">{c.phone}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td className="px-4 py-6 text-center text-ink-soft" colSpan={4}>No customers yet. Add your first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
