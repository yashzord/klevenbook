'use client'
import { useActionState, useState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { STATES } from '@/lib/states'
import { KINDS } from '@/lib/documents'
import type { Sequence, Settings } from '@/lib/types'
import { saveSettings } from './actions'

export function SettingsForm({ settings, sequences }: { settings: Settings; sequences: Sequence[] }) {
  const [state, action] = useActionState(saveSettings, {})
  const [stateCode, setStateCode] = useState(settings.state_code)
  function onGstin(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.slice(0, 2)
    if (STATES[code]) setStateCode(code)
  }
  return (
    <form action={action} className="space-y-6">
      <section className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
        <h2 className="font-semibold sm:col-span-6">Your business</h2>
        <p className="-mt-2 text-sm text-ink-soft sm:col-span-6">Printed at the top of every quotation, invoice and challan.</p>
        <Field label="Business name" className="sm:col-span-3"><input name="business_name" required defaultValue={settings.business_name} className={inputClass} /></Field>
        <Field label="GSTIN" className="sm:col-span-3"><input name="gstin" maxLength={15} defaultValue={settings.gstin ?? ''} onChange={onGstin} className={`${inputClass} uppercase`} /></Field>
        <Field label="Address" className="sm:col-span-6"><textarea name="address" rows={2} defaultValue={settings.address ?? ''} className={inputClass} /></Field>
        <Field label="State" className="sm:col-span-2">
          <select name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputClass}>
            {Object.entries(STATES).map(([code, name]) => <option key={code} value={code}>{code} {name}</option>)}
          </select>
        </Field>
        <Field label="Phone" className="sm:col-span-2"><input name="phone" defaultValue={settings.phone ?? ''} className={inputClass} /></Field>
        <Field label="Email" className="sm:col-span-2"><input name="email" type="email" defaultValue={settings.email ?? ''} className={inputClass} /></Field>
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
        <h2 className="font-semibold sm:col-span-6">How customers pay you</h2>
        <p className="-mt-2 text-sm text-ink-soft sm:col-span-6">Printed on every invoice so the customer can pay from the PDF.</p>
        <Field label="Bank name" className="sm:col-span-2"><input name="bank_name" defaultValue={settings.bank_name ?? ''} className={inputClass} placeholder="HDFC Bank, Alkapur" /></Field>
        <Field label="Account number" className="sm:col-span-2"><input name="bank_account" defaultValue={settings.bank_account ?? ''} className={inputClass} /></Field>
        <Field label="IFSC" className="sm:col-span-2"><input name="bank_ifsc" defaultValue={settings.bank_ifsc ?? ''} className={`${inputClass} uppercase`} placeholder="HDFC0001234" /></Field>
        <Field label="UPI ID" hint="Optional. Prints next to the bank details." className="sm:col-span-3"><input name="upi_id" defaultValue={settings.upi_id ?? ''} className={inputClass} placeholder="klevencare@hdfcbank" /></Field>
        <Field label="Payment due in (days)" hint="Sets the due date printed on new invoices." className="sm:col-span-3"><input name="payment_terms_days" type="number" min="0" max="365" step="1" required defaultValue={settings.payment_terms_days} className={inputClass} /></Field>
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-3">
        <h2 className="font-semibold sm:col-span-3">Numbering</h2>
        <p className="-mt-2 text-sm text-ink-soft sm:col-span-3">Prefix plus a four-digit counter, for example KC-INV-2026-0001. Change the prefix when the financial year changes and set the next number back to 1.</p>
        {sequences.map((s) => (
          <div key={s.kind} className="grid grid-cols-[1fr_90px] gap-2">
            <Field label={`${KINDS[s.kind].label} prefix`}><input name={`prefix_${s.kind}`} required defaultValue={s.prefix} className={inputClass} /></Field>
            <Field label="Next"><input name={`next_${s.kind}`} type="number" min="1" step="1" required defaultValue={s.next_number} className={inputClass} /></Field>
          </div>
        ))}
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Standard wording</h2>
        <Field label="Quotation terms and conditions"><textarea name="quotation_terms" rows={8} defaultValue={settings.quotation_terms ?? ''} className={inputClass} /></Field>
        <Field label="Delivery challan notes"><textarea name="challan_notes" rows={8} defaultValue={settings.challan_notes ?? ''} className={inputClass} /></Field>
      </section>

      <FormError message={state.error} />
      <FormSuccess message={state.ok ? 'Settings saved.' : undefined} />
      <SubmitButton pendingText="Saving">Save settings</SubmitButton>
    </form>
  )
}
