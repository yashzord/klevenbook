'use client'
import { useActionState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import type { Product } from '@/lib/types'
import { addProduct, updateProduct } from './actions'

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState(product ? updateProduct.bind(null, product.id) : addProduct, {})
  // key={state.ok} remounts the form after an add, which clears every field.
  return (
    <form key={product ? product.id : state.ok ?? 0} action={action} className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-6">
      <Field label="Product name" className="sm:col-span-3"><input name="name" required defaultValue={product?.name} className={inputClass} placeholder="Digital BP monitor" /></Field>
      <Field label="HSN" hint="4 to 8 digits. Copy from the vendor's bill or ask your CA."><input name="hsn" defaultValue={product?.hsn ?? ''} className={inputClass} placeholder="9018" /></Field>
      <Field label="Unit" hint="pcs, box, strip, kit"><input name="unit" defaultValue={product?.unit} className={inputClass} placeholder="pcs" /></Field>
      <Field label="GST %" hint="Usually 5, 12 or 18."><input name="gst_rate" type="number" step="0.01" min="0" max="100" required defaultValue={product ? Number(product.gst_rate) : undefined} className={inputClass} placeholder="5" /></Field>
      <Field label="List price (₹)" hint="Your selling price before GST. Can be changed on each document." className="sm:col-span-2"><input name="price" type="number" step="0.01" min="0" required defaultValue={product ? Number(product.price) : undefined} className={inputClass} placeholder="1850.00" /></Field>
      <div className="flex items-end sm:col-span-4"><SubmitButton pendingText="Saving">{product ? 'Save changes' : 'Add product'}</SubmitButton></div>
      <div className="sm:col-span-6"><FormError message={state.error} /><FormSuccess message={!product && state.ok ? 'Product added.' : undefined} /></div>
    </form>
  )
}
