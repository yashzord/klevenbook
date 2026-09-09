import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdateForm } from './update-form'

export const metadata: Metadata = { title: 'New password' }

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login/forgot?expired=1') // only reachable from a valid reset link
  return (
    <main className="mx-auto w-full max-w-sm px-6 pt-20">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">At least 8 characters. You stay signed in afterwards.</p>
      <UpdateForm />
    </main>
  )
}
