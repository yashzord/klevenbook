'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidGstin, stateCodeFromGstin } from '@/lib/gst'
import { STATES } from '@/lib/states'
import type { ActionState } from '@/app/login/actions'

function readCustomer(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase()
  let state_code = String(formData.get('state_code') ?? '')
  if (!name) return { error: 'Give the customer a name.' }
  if (gstin) {
    if (!isValidGstin(gstin)) return { error: 'That GSTIN is not in the right format. It should look like 36AAACB2894G1ZM.' }
    state_code = stateCodeFromGstin(gstin) // the GSTIN decides the state
  }
  if (!STATES[state_code]) return { error: 'Pick the customer\'s state.' }
  return {
    row: {
      name,
      gstin: gstin || null,
      state_code,
      phone: String(formData.get('phone') ?? '').trim() || null,
      address: String(formData.get('address') ?? '').trim() || null,
    },
  }
}

export async function addCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = readCustomer(formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from('customers').insert(r.row)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/customers')
  return { ok: Date.now() }
}

export async function updateCustomer(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = readCustomer(formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from('customers').update(r.row).eq('id', id)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/customers')
  redirect('/customers')
}

export async function deleteCustomer(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return { error: error.code === '23503' ? 'This customer has documents, so it cannot be deleted.' : `Could not delete: ${error.message}` }
  revalidatePath('/customers')
  redirect('/customers')
}
