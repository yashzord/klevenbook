'use client'
import { useActionState, useState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { STATES } from '@/lib/states'
import type { Customer } from '@/lib/types'
import { addCustomer, updateCustomer } from './actions'

export function CustomerForm({ customer }: { customer?: Customer }) {
  const [state, action] = useActionState(customer ? updateCustomer.bind(null, customer.id) : addCustomer, {})
  // key={state.ok} remounts the form after an add, which clears every field.
  const [stateCode, setStateCode] = useState(customer?.state_code ?? '36')

  function onGstin(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.slice(0, 2)
    if (STATES[code]) setStateCode(code) // typing a GSTIN picks the state for you
  }

  return (
    <form key={customer ? customer.id : state.ok ?? 0} action={action} className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
      <Field label="Customer name" className="sm:col-span-3"><input name="name" required defaultValue={customer?.name} className={inputClass} placeholder="Apollo Clinic, Kukatpally" /></Field>
      <Field label="GSTIN (optional)" className="sm:col-span-3"><input name="gstin" maxLength={15} defaultValue={customer?.gstin ?? ''} onChange={onGstin} className={`${inputClass} uppercase`} placeholder="36AAACB2894G1ZM" /></Field>
      <Field label="State" className="sm:col-span-2">
        <select name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputClass}>
          {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} {name}</option>)}
        </select>
      </Field>
      <Field label="Phone" className="sm:col-span-2"><input name="phone" defaultValue={customer?.phone ?? ''} className={inputClass} placeholder="98765 43210" /></Field>
      <Field label="Address" className="sm:col-span-6"><input name="address" defaultValue={customer?.address ?? ''} className={inputClass} placeholder="Street, area, city, PIN" /></Field>
      <div className="sm:col-span-6"><SubmitButton pendingText="Saving">{customer ? 'Save changes' : 'Add customer'}</SubmitButton></div>
      <div className="sm:col-span-6"><FormError message={state.error} /><FormSuccess message={!customer && state.ok ? 'Customer added.' : undefined} /></div>
    </form>
  )
}
