import Link from 'next/link'
import type { Metadata } from 'next'
import { ForgotForm } from './forgot-form'

export const metadata: Metadata = { title: 'Reset password' }

export default async function ForgotPage({ searchParams }: PageProps<'/login/forgot'>) {
  const { expired } = await searchParams
  return (
    <main className="mx-auto w-full max-w-sm px-6 pt-20">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">{expired ? 'That link has expired. Ask for a fresh one.' : 'We email you a link. It works once and expires in an hour.'}</p>
      <ForgotForm />
      <p className="mt-6 text-sm"><Link href="/login" className="text-brand hover:underline">Back to sign in</Link></p>
    </main>
  )
}
