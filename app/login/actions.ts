'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

export async function requestReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Enter your email.' }
  const supabase = await createClient()
  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('x-forwarded-host') ?? h.get('host')}`
  // https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/login/update-password` })
  if (error) return { error: 'Could not send the email right now. Try again in a few minutes.' }
  return { ok: Date.now() } // same answer whether or not the address exists
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '')
  const again = String(formData.get('again') ?? '')
  if (password.length < 8) return { error: 'Use at least 8 characters.' }
  if (password !== again) return { error: 'The two passwords do not match.' }
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'The reset link has expired. Ask for a new one.' }
  redirect('/')
}
