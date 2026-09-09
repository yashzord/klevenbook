'use client'
import { useActionState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { addProduct } from './actions'

export function ProductForm() {
  const [state, action] = useActionState(addProduct, {})
  return (
    <form key={state.ok ?? 0} action={action} className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
      <Field label="Product name" className="sm:col-span-3"><input name="name" required className={inputClass} placeholder="Digital BP monitor" /></Field>
      <Field label="HSN"><input name="hsn" className={inputClass} placeholder="9018" /></Field>
      <Field label="Unit"><input name="unit" className={inputClass} placeholder="pcs" /></Field>
      <Field label="GST %"><input name="gst_rate" type="number" step="0.01" min="0" max="100" required className={inputClass} placeholder="5" /></Field>
      <Field label="List price (₹)" className="sm:col-span-2"><input name="price" type="number" step="0.01" min="0" required className={inputClass} placeholder="1850.00" /></Field>
      <div className="flex items-end sm:col-span-4"><SubmitButton pendingText="Saving">Add product</SubmitButton></div>
      <div className="sm:col-span-6"><FormError message={state.error} /><FormSuccess message={state.ok ? 'Product added.' : undefined} /></div>
    </form>
  )
}
