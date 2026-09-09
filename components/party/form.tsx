'use client'
import { useActionState, useState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { STATES } from '@/lib/states'
import type { Customer } from '@/lib/types'
import { addParty, updateParty, type PartyTable } from './actions'

export function PartyForm({ table, party }: { table: PartyTable; party?: Customer }) {
  const noun = table === 'vendors' ? 'Vendor' : 'Customer'
  const [state, action] = useActionState(party ? updateParty.bind(null, table, party.id) : addParty.bind(null, table), {})
  // key={state.ok} remounts the form after an add, which clears every field.
  const [stateCode, setStateCode] = useState(party?.state_code ?? '36')

  function onGstin(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.slice(0, 2)
    if (STATES[code]) setStateCode(code) // typing a GSTIN picks the state for you
  }

  return (
    <form key={party ? party.id : state.ok ?? 0} action={action} className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
      <Field label={`${noun} name`} className="sm:col-span-3"><input name="name" required defaultValue={party?.name} className={inputClass} placeholder={table === 'vendors' ? 'Medisurge Distributors' : 'Apollo Clinic, Kukatpally'} /></Field>
      <Field label="GSTIN (optional)" className="sm:col-span-3"><input name="gstin" maxLength={15} defaultValue={party?.gstin ?? ''} onChange={onGstin} className={`${inputClass} uppercase`} placeholder="36AAACB2894G1ZM" /></Field>
      <Field label="State" className="sm:col-span-2">
        <select name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputClass}>
          {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} {name}</option>)}
        </select>
      </Field>
      <Field label="Phone" className="sm:col-span-2"><input name="phone" defaultValue={party?.phone ?? ''} className={inputClass} placeholder="98765 43210" /></Field>
      <Field label="Address" className="sm:col-span-6"><input name="address" defaultValue={party?.address ?? ''} className={inputClass} placeholder="Street, area, city, PIN" /></Field>
      <div className="sm:col-span-6"><SubmitButton pendingText="Saving">{party ? 'Save changes' : `Add ${noun.toLowerCase()}`}</SubmitButton></div>
      <div className="sm:col-span-6"><FormError message={state.error} /><FormSuccess message={!party && state.ok ? `${noun} added.` : undefined} /></div>
    </form>
  )
}
