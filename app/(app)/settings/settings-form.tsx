'use client'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
import { DocumentPaper, type PaperDoc, type PaperItem, type PaperParty } from '@/components/documents/paper'
import { PreviewDialog, PreviewInline } from '@/components/documents/preview'
import { STATES } from '@/lib/states'
import { KINDS, type Kind } from '@/lib/documents'
import type { Sequence, Settings } from '@/lib/types'
import { saveSettings } from './actions'

// A made-up sale, used only to show how her details and wording will print.
const SAMPLE_PARTY: PaperParty = { name: 'Sample Hospital', address: 'Road No 1, Banjara Hills, Hyderabad 500034', gstin: '36AAACS1234A1Z5', phone: '98765 43210', state_code: '36' }
const SAMPLE_ITEMS: PaperItem[] = [
  { id: '1', description: 'Digital BP monitor', hsn: '9018', unit: 'Nos', qty: 2, rate: 1850, gst_rate: 5, amount: 3700, tax: 185, batch: 'BP-0812' },
  { id: '2', description: 'Surgical gloves', hsn: '4015', unit: 'box', qty: 5, rate: 420, gst_rate: 12, amount: 2100, tax: 252, batch: 'GL-4471' },
]
const SAMPLE_KINDS: Kind[] = ['invoice', 'quotation', 'challan']
const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

export function SettingsForm({ settings, sequences }: { settings: Settings; sequences: Sequence[] }) {
  const [state, action] = useActionState(saveSettings, {})
  const [stateCode, setStateCode] = useState(settings.state_code)
  const [live, setLive] = useState(settings) // what is typed right now, for the preview
  const [kind, setKind] = useState<Kind>('invoice')
  const prefix = (k: Kind) => sequences.find((s) => s.kind === k)?.prefix ?? ''

  function onGstin(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.slice(0, 2)
    if (STATES[code]) setStateCode(code)
  }
  function onFormChange(e: React.FormEvent<HTMLFormElement>) {
    const f = new FormData(e.currentTarget)
    const text = (k: string) => String(f.get(k) ?? '').trim() || null
    setLive({
      business_name: String(f.get('business_name') ?? ''), gstin: text('gstin')?.toUpperCase() ?? null, address: text('address'), state_code: String(f.get('state_code') ?? '36'),
      phone: text('phone'), email: text('email'), quotation_terms: text('quotation_terms'), challan_notes: text('challan_notes'),
      bank_name: text('bank_name'), bank_account: text('bank_account'), bank_ifsc: text('bank_ifsc')?.toUpperCase() ?? null, upi_id: text('upi_id'),
      payment_terms_days: Number(f.get('payment_terms_days')) || 0,
    })
  }

  const doc: PaperDoc = {
    kind, number: `${prefix(kind)}0001`, date: iso(0), valid_until: kind === 'quotation' ? iso(30) : null, due_date: kind === 'invoice' ? iso(live.payment_terms_days) : null,
    reference: null, eway_bill: null, packages: kind === 'challan' ? 2 : null, gst_type: 'igst', subtotal: 5800, cgst: 0, sgst: 0, igst: 437, total: 6237, notes: null, cancelled_at: null, cancel_reason: null,
  }
  const paper = <DocumentPaper doc={doc} party={SAMPLE_PARTY} items={SAMPLE_ITEMS} settings={live} className="p-10" preview />
  const note = 'A sample sale, to show how your details and wording will print. Nothing here is saved as a document.'
  const kindPicker = (
    <div className="no-print mb-3 inline-flex gap-1 rounded-lg bg-muted p-1">
      {SAMPLE_KINDS.map((k) => <Button key={k} type="button" size="sm" variant={kind === k ? 'outline' : 'ghost'} onClick={() => setKind(k)}>{KINDS[k].label}</Button>)}
    </div>
  )

  return (
    <form data-wide action={action} onChange={onFormChange} className="grid gap-6 @4xl/page:grid-cols-2">
      <div className="@container/form min-w-0 space-y-6">
        <Card>
          <CardHeader><CardTitle>Your business</CardTitle><CardDescription>Printed at the top of every quotation, invoice and challan.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 @xl/form:grid-cols-6">
            <Field label="Business name" className="@xl/form:col-span-3"><Input name="business_name" required defaultValue={settings.business_name} /></Field>
            <Field label="GSTIN" className="@xl/form:col-span-3"><Input name="gstin" maxLength={15} defaultValue={settings.gstin ?? ''} onChange={onGstin} className="uppercase" /></Field>
            <Field label="Address" className="@xl/form:col-span-6"><Textarea name="address" rows={2} defaultValue={settings.address ?? ''} /></Field>
            <Field label="State" className="@xl/form:col-span-2">
              <NativeSelect name="state_code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="w-full">
                {Object.entries(STATES).map(([code, name]) => <NativeSelectOption key={code} value={code}>{code} {name}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
            <Field label="Phone" className="@xl/form:col-span-2"><Input name="phone" defaultValue={settings.phone ?? ''} /></Field>
            <Field label="Email" className="@xl/form:col-span-2"><Input name="email" type="email" defaultValue={settings.email ?? ''} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>How customers pay you</CardTitle><CardDescription>Printed on every invoice and quotation so the customer can pay from the PDF.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 @xl/form:grid-cols-6">
            <Field label="Bank name" className="@xl/form:col-span-2"><Input name="bank_name" defaultValue={settings.bank_name ?? ''} placeholder="HDFC Bank, Alkapur" /></Field>
            <Field label="Account number" className="@xl/form:col-span-2"><Input name="bank_account" defaultValue={settings.bank_account ?? ''} /></Field>
            <Field label="IFSC" className="@xl/form:col-span-2"><Input name="bank_ifsc" defaultValue={settings.bank_ifsc ?? ''} className="uppercase" placeholder="HDFC0001234" /></Field>
            <Field label="UPI ID" hint="Optional. Prints next to the bank details." className="@xl/form:col-span-3"><Input name="upi_id" defaultValue={settings.upi_id ?? ''} placeholder="klevencare@hdfcbank" /></Field>
            <Field label="Payment due in (days)" hint="Sets the Pay by date on new invoices." className="@xl/form:col-span-3"><Input name="payment_terms_days" type="number" min="0" max="365" step="1" required defaultValue={settings.payment_terms_days} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Numbering</CardTitle><CardDescription>Prefix plus a four-digit counter, for example KC-INV-2026-0001. When the financial year changes, change the prefix and set Next back to 1.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 @xl/form:grid-cols-2">
            {sequences.map((s) => (
              <div key={s.kind} className="grid grid-cols-[1fr_96px] gap-2">
                <Field label={`${KINDS[s.kind].label} prefix`}><Input name={`prefix_${s.kind}`} required defaultValue={s.prefix} /></Field>
                <Field label="Next"><Input name={`next_${s.kind}`} type="number" min="1" step="1" required defaultValue={s.next_number} /></Field>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Standard wording</CardTitle><CardDescription>Printed at the foot of quotations and delivery challans. Pick Quotation or Delivery challan in the preview to see it.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 @xl/form:grid-cols-2">
            <Field label="Quotation terms and conditions"><Textarea name="quotation_terms" rows={8} defaultValue={settings.quotation_terms ?? ''} /></Field>
            <Field label="Delivery challan notes"><Textarea name="challan_notes" rows={8} defaultValue={settings.challan_notes ?? ''} /></Field>
          </CardContent>
        </Card>

        <FormError message={state.error} />
        <FormSuccess message={state.ok ? 'Settings saved.' : undefined} />
        <div className="flex flex-wrap gap-2">
          <SubmitButton pendingText="Saving" size="lg">Save settings</SubmitButton>
          <PreviewDialog label="Sample" note={note} className="h-11 @4xl/page:hidden">{kindPicker}{paper}</PreviewDialog>
        </div>
      </div>

      <div className="hidden min-w-0 @4xl/page:sticky @4xl/page:top-4 @4xl/page:block @4xl/page:max-h-[calc(100svh-2rem)] @4xl/page:self-start @4xl/page:overflow-y-auto @4xl/page:p-0.5 [scrollbar-width:thin]">
        {kindPicker}
        <PreviewInline label="Sample">{paper}</PreviewInline>
        <p className="mt-2 text-xs text-muted-foreground">{note}</p>
      </div>
    </form>
  )
}
