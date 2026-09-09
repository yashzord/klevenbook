'use client'
import { useActionState } from 'react'
import { Field, FormError, SubmitButton, inputClass } from '@/components/form'
import { METHODS } from '@/lib/types'
import { addPayment } from './actions'

export function PaymentForm({ invoiceId, due }: { invoiceId: string; due: number }) {
  const [state, action] = useActionState(addPayment.bind(null, invoiceId), {})
  return (
    <form key={state.ok ?? 0} action={action} className="grid gap-2 sm:grid-cols-[110px_130px_1fr_1fr_auto] sm:items-end">
      <Field label="Amount (₹)"><input name="amount" type="number" step="0.01" min="0.01" required defaultValue={due > 0 ? due : undefined} className={inputClass} /></Field>
      <Field label="Date"><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} /></Field>
      <Field label="How">
        <select name="method" defaultValue="bank" className={inputClass}>
          {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field label="Reference (optional)"><input name="reference" placeholder="UTR or cheque number" className={inputClass} /></Field>
      <SubmitButton pendingText="Saving">Record payment</SubmitButton>
      <div className="sm:col-span-5"><FormError message={state.error} /></div>
    </form>
  )
}
