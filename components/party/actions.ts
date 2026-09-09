'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidGstin, stateCodeFromGstin } from '@/lib/gst'
import { STATES } from '@/lib/states'
import type { ActionState } from '@/app/login/actions'

export type PartyTable = 'customers' | 'vendors'
const PATH: Record<PartyTable, string> = { customers: '/customers', vendors: '/vendors' }

function read(table: PartyTable, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase()
  let state_code = String(formData.get('state_code') ?? '')
  if (!name) return { error: `Give the ${table === 'vendors' ? 'vendor' : 'customer'} a name.` }
  if (gstin) {
    if (!isValidGstin(gstin)) return { error: 'That GSTIN is not in the right format. It should look like 36AAACB2894G1ZM.' }
    state_code = stateCodeFromGstin(gstin) // the GSTIN decides the state
  }
  if (!STATES[state_code]) return { error: 'Pick the state.' }
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

export async function addParty(table: PartyTable, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = read(table, formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from(table).insert(r.row)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath(PATH[table])
  return { ok: Date.now() }
}

export async function updateParty(table: PartyTable, id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const r = read(table, formData)
  if ('error' in r) return r
  const supabase = await createClient()
  const { error } = await supabase.from(table).update(r.row).eq('id', id)
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath(PATH[table])
  redirect(PATH[table])
}

export async function deleteParty(table: PartyTable, id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return { error: error.code === '23503' ? 'There are documents for this name, so it cannot be deleted.' : `Could not delete: ${error.message}` }
  revalidatePath(PATH[table])
  redirect(PATH[table])
}
