import Image from 'next/image'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { NavLink } from './nav-link'
import { MobileMenu } from './mobile-menu'

const links = [
  ['/', 'Home'], ['/invoices', 'Invoices'], ['/quotations', 'Quotations'], ['/challans', 'Challans'], ['/purchases', 'Purchases'],
  ['/products', 'Products'], ['/customers', 'Customers'], ['/vendors', 'Vendors'],
] as const
const rightLinks = [['/help', 'Help'], ['/settings', 'Settings']] as const

export default function AppLayout({ children }: LayoutProps<'/'>) {
  const signOut = <form action={logout}><button className="w-full rounded-md px-3 py-1.5 text-left text-ink-soft hover:bg-tint hover:text-ink">Sign out</button></form>
  return (
    <>
      <div className="rule-brand no-print" />
      <header className="no-print relative border-b border-line bg-paper">
        <nav className="mx-auto flex max-w-6xl items-center gap-0.5 whitespace-nowrap px-4 py-2 text-sm">
          <Link href="/" className="mr-3 flex items-center gap-2 font-semibold"><Image src="/icon.png" alt="" width={28} height={28} /> KlevenBook</Link>
          <div className="hidden items-center gap-1 lg:flex">{links.map(([h, l]) => <NavLink key={h} href={h}>{l}</NavLink>)}</div>
          <div className="ml-auto hidden items-center gap-1 lg:flex">{rightLinks.map(([h, l]) => <NavLink key={h} href={h}>{l}</NavLink>)}{signOut}</div>
          <div className="ml-auto lg:hidden">
            <MobileMenu>
              {[...links, ...rightLinks].map(([h, l]) => <NavLink key={h} href={h}>{l}</NavLink>)}
              {signOut}
            </MobileMenu>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
    </>
  )
}
