import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }
export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[5fr_4fr]">
      <section className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,var(--color-brand-deep)_0%,transparent_60%),radial-gradient(50%_50%_at_90%_90%,var(--color-leaf-bright)_0%,transparent_55%)] opacity-90" />
        <div className="relative flex items-center gap-3 text-lg font-semibold">
          <Image src="/icon.png" alt="" width={36} height={36} className="rounded-md bg-white p-0.5" /> KlevenBook
        </div>
        <div className="relative motion-safe:animate-[rise_.7s_ease-out_both]">
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Invoices that are right the first time.</h1>
          <p className="mt-4 max-w-md text-white/75">GST worked out per line. Serial numbers that never skip. A tax invoice ready to print in under a minute.</p>
        </div>
        <p className="relative text-sm text-white/60">Kleven Care, Hyderabad</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Image src="/logo.png" alt="Kleven Care" width={140} height={140} priority className="mb-6 lg:hidden" />
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mb-6 mt-1 text-sm text-ink-soft">Use the account Yash set up for you.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
