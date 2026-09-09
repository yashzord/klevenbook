import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'
import type { Customer } from '@/lib/types'
import { addCustomer } from './actions'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  const customers = data as Customer[]

  return (
    <>
      <h1 className="mb-4 text-xl font-semibold">Customers</h1>
      <form action={addCustomer} className="mb-6 grid grid-cols-6 gap-2 rounded bg-white p-4 shadow">
        <input name="name" required placeholder="Customer name" className="col-span-2 rounded border p-2" />
        <input name="gstin" placeholder="GSTIN (optional)" maxLength={15} className="col-span-2 rounded border p-2 uppercase" />
        <select name="state_code" defaultValue="36" className="rounded border p-2">
          {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} {name}</option>)}
        </select>
        <input name="phone" placeholder="Phone" className="rounded border p-2" />
        <input name="address" placeholder="Address" className="col-span-6 rounded border p-2" />
        <button className="col-span-6 rounded bg-slate-900 p-2 text-white">Add customer</button>
      </form>
      <table className="w-full bg-white text-sm shadow">
        <thead className="bg-slate-100 text-left"><tr><th className="p-2">Name</th><th className="p-2">GSTIN</th><th className="p-2">State</th><th className="p-2">Phone</th></tr></thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td><td className="p-2 font-mono">{c.gstin}</td>
              <td className="p-2">{STATES[c.state_code]}</td><td className="p-2">{c.phone}</td>
            </tr>
          ))}
          {customers.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={4}>No customers yet.</td></tr>}
        </tbody>
      </table>
    </>
  )
}
