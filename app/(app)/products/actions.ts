'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/app/login/actions'

function readProduct(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const price = Number(formData.get('price'))
  const gst_rate = Number(formData.get('gst_rate'))
  if (!name) return { error: 'Give the product a name.' }
  if (!(price >= 0)) return { error: 'Price must be 0 or more.' }
  if (!(gst_rate >= 0 && gst_rate <= 100)) return { error: 'GST rate must be between 0 and 100.' }
  return {
    row: {
      name,
      hsn: String(formData.get('hsn') ?? '').trim() || null,
      unit: String(formData.get('unit') ?? '').trim() || 'pcs',
      price,
      gst_rate,
    },
  }
}

export async function addProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = readProduct(formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from('products').insert(r.row)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/products')
  return { ok: Date.now() }
}

export async function updateProduct(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = readProduct(formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from('products').update(r.row).eq('id', id)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/products')
  redirect('/products')
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  // Foreign key from invoice_items keeps products that appear on any document.
  if (error) return { error: error.code === '23503' ? 'This product is on a document, so it cannot be deleted. Rename it or set the price to 0 instead.' : `Could not delete: ${error.message}` }
  revalidatePath('/products')
  redirect('/products')
}
