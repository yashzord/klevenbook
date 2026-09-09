'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGstin, stateCodeFromGstin } from '@/lib/gst'
import { STATES } from '@/lib/states'
import { KINDS, isKind } from '@/lib/documents'
import type { ActionState } from '@/app/login/actions'

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const business_name = String(formData.get('business_name') ?? '').trim()
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase()
  let state_code = String(formData.get('state_code') ?? '')
  if (!business_name) return { error: 'Business name is required. It prints on every document.' }
  if (gstin) {
    if (!isValidGstin(gstin)) return { error: 'That GSTIN is not in the right format.' }
    state_code = stateCodeFromGstin(gstin)
  }
  if (!STATES[state_code]) return { error: 'Pick your state.' }

  const supabase = await createClient()
  const { error } = await supabase.from('settings').update({
    business_name,
    gstin: gstin || null,
    state_code,
    address: String(formData.get('address') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    quotation_terms: String(formData.get('quotation_terms') ?? '').trim() || null,
    challan_notes: String(formData.get('challan_notes') ?? '').trim() || null,
  }).eq('id', 1)
  if (error) return { error: `Could not save: ${error.message}` }

  for (const kind of Object.keys(KINDS)) {
    if (!isKind(kind)) continue
    const prefix = String(formData.get(`prefix_${kind}`) ?? '').trim()
    const next = Number(formData.get(`next_${kind}`))
    if (!prefix) return { error: `${KINDS[kind].label} prefix cannot be empty.` }
    if (!(Number.isInteger(next) && next >= 1)) return { error: `${KINDS[kind].label} next number must be 1 or more.` }
    const { error: e } = await supabase.from('sequences').update({ prefix, next_number: next }).eq('kind', kind)
    if (e) return { error: `Could not save numbering: ${e.message}` }
  }
  revalidatePath('/', 'layout')
  return { ok: Date.now() }
}
