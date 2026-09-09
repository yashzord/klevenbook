'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGstin, stateCodeFromGstin } from '@/lib/gst'
import { STATES } from '@/lib/states'

export async function addCustomer(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase()
  let state_code = String(formData.get('state_code') ?? '')
  if (!name) throw new Error('Name is required')
  if (gstin) {
    if (!isValidGstin(gstin)) throw new Error('GSTIN format is invalid')
    state_code = stateCodeFromGstin(gstin) // GSTIN wins over the dropdown
  }
  if (!STATES[state_code]) throw new Error('Pick a state')

  const supabase = await createClient()
  const { error } = await supabase.from('customers').insert({
    name,
    gstin: gstin || null,
    state_code,
    phone: String(formData.get('phone') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
  })
  if (error) throw error
  revalidatePath('/customers')
}
