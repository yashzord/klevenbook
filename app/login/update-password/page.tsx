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
    <main className="flex min-h-screen items-center justify-center bg-sidebar p-6">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 sm:p-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">At least 8 characters. You stay signed in afterwards.</p>
      <UpdateForm />
      </div>
    </main>
  )
}
