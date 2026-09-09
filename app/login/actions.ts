'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { error?: string; ok?: number }

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  })
  if (error) return { error: 'That email and password do not match. Check both and try again.' }
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
