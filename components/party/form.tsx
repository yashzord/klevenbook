'use client'
import { useActionState, useState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { STATES } from '@/lib/states'
import type { Vendor } from '@/lib/types'
import { addParty, updateParty, type PartyTable } from './actions'

export function PartyForm({ table, party }: { table: PartyTable; party?: Vendor }) {
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
      {table === 'vendors' && (
        <>
          <p className="pt-2 font-medium sm:col-span-6">Their bank details</p>
          <Field label="Bank name" className="sm:col-span-2"><input name="bank_name" defaultValue={party?.bank_name ?? ''} className={inputClass} placeholder="SBI, Surat main branch" /></Field>
          <Field label="Account number" className="sm:col-span-2"><input name="bank_account" defaultValue={party?.bank_account ?? ''} className={inputClass} /></Field>
          <Field label="IFSC" className="sm:col-span-2"><input name="bank_ifsc" defaultValue={party?.bank_ifsc ?? ''} className={`${inputClass} uppercase`} placeholder="SBIN0001234" /></Field>
          <Field label="UPI ID (optional)" className="sm:col-span-3"><input name="upi_id" defaultValue={party?.upi_id ?? ''} className={inputClass} /></Field>
        </>
      )}
      <div className="sm:col-span-6"><SubmitButton pendingText="Saving">{party ? 'Save changes' : `Add ${noun.toLowerCase()}`}</SubmitButton></div>
      <div className="sm:col-span-6"><FormError message={state.error} /><FormSuccess message={!party && state.ok ? `${noun} added.` : undefined} /></div>
    </form>
  )
}
