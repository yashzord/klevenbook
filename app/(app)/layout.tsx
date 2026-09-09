import Image from 'next/image'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { NavLink } from './nav-link'

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <div className="rule-brand no-print" />
      <header className="no-print border-b border-line bg-paper">
        <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2 text-sm">
          <Link href="/" className="mr-4 flex items-center gap-2 font-semibold"><Image src="/icon.png" alt="" width={28} height={28} /> KlevenBook</Link>
          <NavLink href="/">Invoices</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/customers">Customers</NavLink>
          <form action={logout} className="ml-auto"><button className="rounded-md px-3 py-1.5 text-ink-soft hover:bg-tint hover:text-ink">Sign out</button></form>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
    </>
  )
}
