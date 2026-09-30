'use client'
import { useState } from 'react'
import { Download, MessageCircle, Pencil, Plus, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/combobox'
import { DatePicker } from '@/components/date-picker'
import { DeleteButton } from '@/components/delete-button'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
import { UNITS } from '@/lib/types'

// Click a swatch to copy its value.
export function Swatch({ name, hex, note, contrast }: { name: string; hex: string; note?: string; contrast?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked: the value is printed below */ }
  }
  return (
    <button type="button" onClick={copy} className="flex flex-col justify-start rounded-xl bg-card p-2 text-left shadow-xs ring-1 ring-foreground/10 transition hover:ring-primary/50">
      <span className="block h-14 rounded-lg border" style={{ background: hex }} />
      <span className="mt-2 block text-sm font-medium">{name}</span>
      <span className="block text-xs text-muted-foreground" aria-live="polite">{copied ? 'Copied' : hex}</span>
      {contrast && <span className="block text-xs text-muted-foreground">{contrast}</span>}
      {note && <span className="mt-1 block text-xs text-muted-foreground">{note}</span>}
    </button>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function ButtonDemos() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button><Plus /> New invoice</Button>
        <Button variant="outline"><Pencil /> Edit</Button>
        <Button variant="secondary">Original</Button>
        <Button variant="ghost">Add line</Button>
        <Button variant="destructive">Cancel invoice</Button>
        <Button variant="link">Forgot your password?</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline">Small, 32px</Button>
        <Button variant="outline"><Download /> Default, 40px</Button>
        <Button size="lg">Large, 44px</Button>
        <Button size="icon" variant="outline" aria-label="Print"><Printer /></Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <form action={async () => { await wait(1200) }}><SubmitButton pendingText="Saving">Save changes</SubmitButton></form>
        <Button className="bg-whatsapp text-foreground hover:bg-whatsapp/85"><MessageCircle /> Send on WhatsApp</Button>
        <DeleteButton label="customer" action={async () => { await wait(600); return { error: 'There are documents for this name, so it cannot be deleted. Press Hide instead.' } }} />
      </div>
    </div>
  )
}

const PRODUCTS = [
  { value: '1', label: 'Nebuliser Kit with T-connector', hint: '₹115.00' },
  { value: '2', label: 'Elastic Adhesive Bandage', hint: '₹335.00' },
  { value: '3', label: 'Laproscopic trolley', hint: '₹35,000.00' },
]

export function FormDemos() {
  const [done, setDone] = useState(false)
  const [product, setProduct] = useState('')
  return (
    <form action={async () => { await wait(900); setDone(true) }} className="grid gap-4 sm:grid-cols-6">
      <Field label="Product" className="sm:col-span-3"><Combobox label="Product" options={PRODUCTS} value={product} onChange={setProduct} placeholder="Choose a product" searchPlaceholder="Search products" /></Field>
      <Field label="HSN" hint="4 to 8 digits. Copy from the vendor's bill." className="sm:col-span-3"><Input placeholder="9018" /></Field>
      <Field label="Unit" hint="How it is counted. Not the quantity." className="sm:col-span-2">
        <NativeSelect defaultValue="Nos" className="w-full">{UNITS.map((u) => <NativeSelectOption key={u}>{u}</NativeSelectOption>)}</NativeSelect>
      </Field>
      <Field label="Invoice date" className="sm:col-span-2"><DatePicker name="demo_date" defaultValue="2026-05-09" /></Field>
      <Field label="Read only" className="sm:col-span-2"><Input disabled defaultValue="KC-INV-2026-0001" /></Field>
      <Field label="Notes" className="sm:col-span-6"><Textarea rows={2} placeholder="Payment due within 30 days" /></Field>
      <div className="space-y-3 sm:col-span-6">
        <FormError message="That GSTIN is not in the right format. It should look like 36AAACB2894G1ZM." />
        <FormSuccess message={done ? 'Product added.' : undefined} />
        <SubmitButton pendingText="Saving">Add product</SubmitButton>
      </div>
    </form>
  )
}
