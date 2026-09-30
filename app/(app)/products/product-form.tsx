'use client'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
import { UNITS, type Product } from '@/lib/types'
import { addProduct, updateProduct } from './actions'

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState(product ? updateProduct.bind(null, product.id) : addProduct, {})
  // key={state.ok} remounts the form after an add, which clears every field.
  return (
    <form key={product ? product.id : state.ok ?? 0} action={action} className="grid gap-4 sm:grid-cols-6">
      <Field label="Product name" className="sm:col-span-4"><Input name="name" required defaultValue={product?.name} placeholder="Digital BP monitor" /></Field>
      <Field label="HSN" hint="4 to 8 digits. Copy from the vendor's bill." className="sm:col-span-2"><Input name="hsn" defaultValue={product?.hsn ?? ''} placeholder="9018" /></Field>
      <Field label="Unit" hint="How it is counted. Not the quantity." className="sm:col-span-2">
        <NativeSelect name="unit" defaultValue={product?.unit ?? 'Nos'} className="w-full">
          {product && !UNITS.includes(product.unit as never) && <NativeSelectOption value={product.unit}>{product.unit}</NativeSelectOption>}
          {UNITS.map((u) => <NativeSelectOption key={u} value={u}>{u}</NativeSelectOption>)}
        </NativeSelect>
      </Field>
      <Field label="GST %" hint="Usually 5, 12 or 18." className="sm:col-span-2"><Input name="gst_rate" type="number" step="0.01" min="0" max="100" required defaultValue={product ? Number(product.gst_rate) : undefined} placeholder="5" /></Field>
      <Field label="List price (₹)" hint="Selling price before GST." className="sm:col-span-2"><Input name="price" type="number" step="0.01" min="0" required defaultValue={product ? Number(product.price) : undefined} placeholder="1850.00" /></Field>
      <div className="space-y-3 sm:col-span-6">
        <FormError message={state.error} />
        <FormSuccess message={!product && state.ok ? 'Product added.' : undefined} />
        <SubmitButton pendingText="Saving">{product ? 'Save changes' : 'Add product'}</SubmitButton>
      </div>
    </form>
  )
}
