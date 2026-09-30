'use client'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { DatePicker } from '@/components/date-picker'
import { Field, FormError, SubmitButton } from '@/components/form'
import { METHODS } from '@/lib/types'
import { addPayment } from './actions'

export function PaymentForm({ invoiceId, due }: { invoiceId: string; due: number }) {
  const [state, action] = useActionState(addPayment.bind(null, invoiceId), {})
  return (
    <form key={state.ok ?? 0} action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Amount (₹)"><Input name="amount" type="number" step="0.01" min="0.01" required defaultValue={due > 0 ? due : undefined} /></Field>
      <Field label="Date"><DatePicker name="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
      <Field label="How">
        <NativeSelect name="method" defaultValue="bank" className="w-full">
          {Object.entries(METHODS).map(([k, v]) => <NativeSelectOption key={k} value={k}>{v}</NativeSelectOption>)}
        </NativeSelect>
      </Field>
      <Field label="Reference"><Input name="reference" placeholder="UTR or cheque no. (optional)" /></Field>
      <div className="space-y-3 sm:col-span-2 lg:col-span-4">
        <FormError message={state.error} />
        <SubmitButton pendingText="Saving">Record payment</SubmitButton>
      </div>
    </form>
  )
}
