'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/app/login/actions'

export async function addProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get('name') ?? '').trim()
  const price = Number(formData.get('price'))
  const gst_rate = Number(formData.get('gst_rate'))
  if (!name) return { error: 'Give the product a name.' }
  if (!(price >= 0)) return { error: 'Price must be 0 or more.' }
  if (!(gst_rate >= 0 && gst_rate <= 100)) return { error: 'GST rate must be between 0 and 100.' }

  const supabase = await createClient()
  const { error } = await supabase.from('products').insert({
    name,
    hsn: String(formData.get('hsn') ?? '').trim() || null,
    unit: String(formData.get('unit') ?? '').trim() || 'pcs',
    price,
    gst_rate,
  })
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/products')
  return { ok: Date.now() }
}
