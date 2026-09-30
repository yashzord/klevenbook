'use client'
import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
import { STATES } from '@/lib/states'
import type { Vendor } from '@/lib/types'
import { BankDetails, PartyBlock } from '@/components/documents/paper'
import { addParty, updateParty, type PartyTable } from './actions'

export function PartyForm({ table, party }: { table: PartyTable; party?: Vendor }) {
  const noun = table === 'vendors' ? 'Vendor' : 'Customer'
  const [state, action] = useActionState(party ? updateParty.bind(null, table, party.id) : addParty.bind(null, table), {})
  // key={state.ok} remounts the form after an add, which clears every field.
  const [stateCode, setStateCode] = useState(party?.state_code ?? '36')
  // What is typed right now, to show how it will print.
  const [live, setLive] = useState({ name: party?.name ?? '', gstin: party?.gstin ?? null, address: party?.address ?? null, phone: party?.phone ?? null,
    bank_name: party?.bank_name ?? null, bank_account: party?.bank_account ?? null, bank_ifsc: party?.bank_ifsc ?? null, upi_id: party?.upi_id ?? null })
  function onFormChange(e: React.FormEvent<HTMLFormElement>) {
    const f = new FormData(e.currentTarget)
    const text = (k: string) => String(f.get(k) ?? '').trim() || null
    setLive({ name: text('name') ?? '', gstin: text('gstin')?.toUpperCase() ?? null, address: text('address'), phone: text('phone'),
      bank_name: text('bank_name'), bank_account: text('bank_account'), bank_ifsc: text('bank_ifsc')?.toUpperCase() ?? null, upi_id: text('upi_id') })
  }

  function onGstin(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.slice(0, 2)
    if (STATES[code]) setStateCode(code) // typing a GSTIN picks the state for you
  }

  return (
    <form key={party ? party.id : state.ok ?? 0} action={action} onChange={onFormChange} className="grid gap-4 sm:grid-cols-6">
      <Field label={`${noun} name`} className="sm:col-span-3"><Input name="name" required defaultValue={party?.name} placeholder={table === 'vendors' ? 'Medisurge Distributors' : 'Apollo Clinic, Kukatpally'} /></Field>
      <Field label="GSTIN (optional)" className="sm:col-span-3"><Input name="gstin" maxLength={15} defaultValue={party?.gstin ?? ''} onChange={onGstin} className="uppercase" placeholder="36AAACB2894G1ZM" /></Field>
      <Field label="State" className="sm:col-span-3">
        <NativeSelect name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="w-full">
          {Object.entries(STATES).map(([code, name]) => <NativeSelectOption key={code} value={code}>{code} {name}</NativeSelectOption>)}
        </NativeSelect>
      </Field>
      <Field label="Phone" className="sm:col-span-3"><Input name="phone" defaultValue={party?.phone ?? ''} placeholder="98765 43210" /></Field>
      <Field label="Address" className="sm:col-span-6"><Input name="address" defaultValue={party?.address ?? ''} placeholder="Street, area, city, PIN" /></Field>
      {table === 'vendors' && (
        <>
          <p className="border-t pt-4 text-sm font-medium sm:col-span-6">Their bank details</p>
          <Field label="Bank name" className="sm:col-span-2"><Input name="bank_name" defaultValue={party?.bank_name ?? ''} placeholder="SBI, Surat main branch" /></Field>
          <Field label="Account number" className="sm:col-span-2"><Input name="bank_account" defaultValue={party?.bank_account ?? ''} /></Field>
          <Field label="IFSC" className="sm:col-span-2"><Input name="bank_ifsc" defaultValue={party?.bank_ifsc ?? ''} className="uppercase" placeholder="SBIN0001234" /></Field>
          <Field label="UPI ID (optional)" className="sm:col-span-3"><Input name="upi_id" defaultValue={party?.upi_id ?? ''} /></Field>
        </>
      )}
      <div className="border-t pt-4 sm:col-span-6">
        <p className="mb-2 text-xs text-muted-foreground">How it prints on a document</p>
        <div className="grid gap-3 md:grid-cols-2">
          <PartyBlock kind={table === 'vendors' ? 'purchase' : 'invoice'} party={{ ...live, state_code: stateCode }} />
          {table === 'vendors' && <BankDetails title="Vendor's bank details" bank={live} className="mt-0" />}
        </div>
      </div>
      <div className="space-y-3 sm:col-span-6">
        <FormError message={state.error} />
        <FormSuccess message={!party && state.ok ? `${noun} added.` : undefined} />
        <SubmitButton pendingText="Saving">{party ? 'Save changes' : `Add ${noun.toLowerCase()}`}</SubmitButton>
      </div>
    </form>
  )
}
