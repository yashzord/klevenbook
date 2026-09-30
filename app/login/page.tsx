import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }
export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[5fr_4fr]">
      <section className="relative hidden overflow-hidden bg-foreground text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,var(--primary)_0%,transparent_60%),radial-gradient(50%_50%_at_90%_90%,var(--brand-green)_0%,transparent_55%)] opacity-90" />
        <div className="relative flex items-center gap-3 font-heading text-lg font-semibold">
          <Image src="/icon.png" alt="" width={36} height={36} className="rounded-md bg-white p-0.5" /> KlevenBook
        </div>
        <div className="relative motion-safe:animate-[rise_.7s_ease-out_both]">
          <h1 className="max-w-md font-heading text-4xl leading-tight font-semibold tracking-tight">Invoices that are right the first time.</h1>
          <p className="mt-4 max-w-md text-white/75">GST worked out per line. Serial numbers that never skip. A tax invoice ready to print in under a minute.</p>
        </div>
        <p className="relative text-sm text-white/60">Kleven Care, Hyderabad</p>
      </section>
      <section className="flex items-center justify-center bg-sidebar p-6">
        <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 sm:p-8">
          <Image src="/logo.png" alt="Kleven Care" width={96} height={96} priority className="mb-4 lg:hidden" />
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Use the account set up for you.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
