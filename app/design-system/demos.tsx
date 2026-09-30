'use client'
import { useState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { DateInput } from '@/components/date-input'
import { DeleteButton } from '@/components/delete-button'
import { UNITS } from '@/lib/types'

// Click a swatch to copy its hex.
export function Swatch({ name, hex, note, contrast }: { name: string; hex: string; note?: string; contrast?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked: the hex is printed below */ }
  }
  return (
    <button type="button" onClick={copy} className="rounded-lg border border-line bg-paper p-2 text-left transition hover:border-brand">
      <span className="block h-16 rounded-md border border-line" style={{ background: hex }} />
      <span className="mt-2 block text-sm font-medium">{name}</span>
      <span className="block text-xs text-ink-soft" aria-live="polite">{copied ? 'Copied' : hex}{contrast ? ` · ${contrast}` : ''}</span>
      {note && <span className="mt-1 block text-xs text-ink-soft">{note}</span>}
    </button>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function ButtonDemos() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={async () => { await wait(1200) }}><SubmitButton pendingText="Saving">Save changes</SubmitButton></form>
      <button type="button" className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 py-2 font-medium text-brand-deep transition hover:bg-tint">Edit</button>
      <button type="button" className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-brand transition hover:bg-tint">Add line</button>
      <button type="button" className="inline-flex min-h-11 items-center rounded-md bg-whatsapp px-4 py-2 font-medium text-ink transition hover:brightness-95">Send on WhatsApp</button>
      <DeleteButton label="customer" action={async () => { await wait(600); return { error: 'This customer has documents, so it cannot be deleted. Press Hide instead.' } }} />
    </div>
  )
}

export function FormDemos() {
  const [done, setDone] = useState(false)
  return (
    <form action={async () => { await wait(900); setDone(true) }} className="grid gap-3 sm:grid-cols-6">
      <Field label="Product name" className="sm:col-span-3"><input className={inputClass} placeholder="Digital BP monitor" /></Field>
      <Field label="HSN" hint="4 to 8 digits. Copy from the vendor's bill." className="sm:col-span-3"><input className={inputClass} placeholder="9018" /></Field>
      <Field label="Unit" hint="How it is counted. Not the quantity." className="sm:col-span-2">
        <select className={inputClass} defaultValue="Nos">{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
      </Field>
      <Field label="Invoice date" className="sm:col-span-2"><DateInput name="demo_date" defaultValue="2026-05-09" /></Field>
      <Field label="Disabled" className="sm:col-span-2"><input className={inputClass} disabled defaultValue="KC-INV-2026-0001" /></Field>
      <div className="space-y-2 sm:col-span-6">
        <FormError message="That GSTIN is not in the right format. It should look like 36AAACB2894G1ZM." />
        <FormSuccess message={done ? 'Product added.' : undefined} />
      </div>
      <div className="sm:col-span-6"><SubmitButton pendingText="Saving">Add product</SubmitButton></div>
    </form>
  )
}
