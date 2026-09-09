'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGstin, stateCodeFromGstin } from '@/lib/gst'
import { STATES } from '@/lib/states'
import type { ActionState } from '@/app/login/actions'

export async function addCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get('name') ?? '').trim()
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase()
  let state_code = String(formData.get('state_code') ?? '')
  if (!name) return { error: 'Give the customer a name.' }
  if (gstin) {
    if (!isValidGstin(gstin)) return { error: 'That GSTIN is not in the right format. It should look like 36AAACB2894G1ZM.' }
    state_code = stateCodeFromGstin(gstin) // the GSTIN decides the state
  }
  if (!STATES[state_code]) return { error: 'Pick the customer\'s state.' }

  const supabase = await createClient()
  const { error } = await supabase.from('customers').insert({
    name,
    gstin: gstin || null,
    state_code,
    phone: String(formData.get('phone') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
  })
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/customers')
  return { ok: Date.now() }
}
