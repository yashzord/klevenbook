'use client'
import { useActionState, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
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
      <Card>
        <CardHeader><CardTitle>Your business</CardTitle><CardDescription>Printed at the top of every quotation, invoice and challan.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-6">
          <Field label="Business name" className="sm:col-span-3"><Input name="business_name" required defaultValue={settings.business_name} /></Field>
          <Field label="GSTIN" className="sm:col-span-3"><Input name="gstin" maxLength={15} defaultValue={settings.gstin ?? ''} onChange={onGstin} className="uppercase" /></Field>
          <Field label="Address" className="sm:col-span-6"><Textarea name="address" rows={2} defaultValue={settings.address ?? ''} /></Field>
          <Field label="State" className="sm:col-span-2">
            <NativeSelect name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="w-full">
              {Object.entries(STATES).map(([code, name]) => <NativeSelectOption key={code} value={code}>{code} {name}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field label="Phone" className="sm:col-span-2"><Input name="phone" defaultValue={settings.phone ?? ''} /></Field>
          <Field label="Email" className="sm:col-span-2"><Input name="email" type="email" defaultValue={settings.email ?? ''} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How customers pay you</CardTitle><CardDescription>Printed on every invoice and quotation so the customer can pay from the PDF.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-6">
          <Field label="Bank name" className="sm:col-span-2"><Input name="bank_name" defaultValue={settings.bank_name ?? ''} placeholder="HDFC Bank, Alkapur" /></Field>
          <Field label="Account number" className="sm:col-span-2"><Input name="bank_account" defaultValue={settings.bank_account ?? ''} /></Field>
          <Field label="IFSC" className="sm:col-span-2"><Input name="bank_ifsc" defaultValue={settings.bank_ifsc ?? ''} className="uppercase" placeholder="HDFC0001234" /></Field>
          <Field label="UPI ID" hint="Optional. Prints next to the bank details." className="sm:col-span-3"><Input name="upi_id" defaultValue={settings.upi_id ?? ''} placeholder="klevencare@hdfcbank" /></Field>
          <Field label="Payment due in (days)" hint="Sets the Pay by date on new invoices." className="sm:col-span-3"><Input name="payment_terms_days" type="number" min="0" max="365" step="1" required defaultValue={settings.payment_terms_days} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Numbering</CardTitle><CardDescription>Prefix plus a four-digit counter, for example KC-INV-2026-0001. When the financial year changes, change the prefix and set Next back to 1.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {sequences.map((s) => (
            <div key={s.kind} className="grid grid-cols-[1fr_96px] gap-2">
              <Field label={`${KINDS[s.kind].label} prefix`}><Input name={`prefix_${s.kind}`} required defaultValue={s.prefix} /></Field>
              <Field label="Next"><Input name={`next_${s.kind}`} type="number" min="1" step="1" required defaultValue={s.next_number} /></Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Standard wording</CardTitle><CardDescription>Printed at the foot of quotations and delivery challans.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Quotation terms and conditions"><Textarea name="quotation_terms" rows={8} defaultValue={settings.quotation_terms ?? ''} /></Field>
          <Field label="Delivery challan notes"><Textarea name="challan_notes" rows={8} defaultValue={settings.challan_notes ?? ''} /></Field>
        </CardContent>
      </Card>

      <FormError message={state.error} />
      <FormSuccess message={state.ok ? 'Settings saved.' : undefined} />
      <SubmitButton pendingText="Saving" size="lg">Save settings</SubmitButton>
    </form>
  )
}
