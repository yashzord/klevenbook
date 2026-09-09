import Link from 'next/link'
import { logout } from '@/app/login/actions'

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <nav className="no-print flex items-center gap-6 border-b bg-white px-6 py-3">
        <Link href="/" className="font-semibold">KlevenBook</Link>
        <Link href="/">Invoices</Link>
        <Link href="/products">Products</Link>
        <Link href="/customers">Customers</Link>
        <form action={logout} className="ml-auto"><button className="text-sm text-slate-500">Sign out</button></form>
      </nav>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </>
  )
}
