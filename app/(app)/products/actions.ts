'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addProduct(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const price = Number(formData.get('price'))
  const gst_rate = Number(formData.get('gst_rate'))
  if (!name || !(price >= 0) || !(gst_rate >= 0 && gst_rate <= 100)) throw new Error('Invalid product')

  const supabase = await createClient()
  const { error } = await supabase.from('products').insert({
    name,
    hsn: String(formData.get('hsn') ?? '').trim() || null,
    unit: String(formData.get('unit') ?? 'pcs').trim() || 'pcs',
    price,
    gst_rate,
  })
  if (error) throw error
  revalidatePath('/products')
}
