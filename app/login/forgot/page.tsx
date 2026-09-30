import Link from 'next/link'
import type { Metadata } from 'next'
import { ForgotForm } from './forgot-form'

export const metadata: Metadata = { title: 'Reset password' }

export default async function ForgotPage({ searchParams }: PageProps<'/login/forgot'>) {
  const { expired } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar p-6">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 sm:p-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">{expired ? 'That link has expired. Ask for a fresh one.' : 'We email you a link. It works once and expires in an hour.'}</p>
      <ForgotForm />
      <p className="mt-6 text-sm"><Link href="/login" className="text-primary underline-offset-4 hover:underline">Back to sign in</Link></p>
      </div>
    </main>
  )
}
