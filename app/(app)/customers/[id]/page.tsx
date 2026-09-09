import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/lib/types'
import { DeleteButton } from '@/components/delete-button'
import { CustomerForm } from '../customer-form'
import { deleteCustomer } from '../actions'

export default async function EditCustomerPage({ params }: PageProps<'/customers/[id]'>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single<Customer>()
  if (!customer) notFound()
  return (
    <>
      <Link href="/customers" className="text-sm text-ink-soft hover:text-ink">← All customers</Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold">{customer.name}</h1>
      <p className="mb-5 text-sm text-ink-soft">Changes show on new documents. Documents already made keep the old details.</p>
      <CustomerForm customer={customer} />
      <div className="mt-4"><DeleteButton action={deleteCustomer.bind(null, customer.id)} label="customer" /></div>
    </>
  )
}
