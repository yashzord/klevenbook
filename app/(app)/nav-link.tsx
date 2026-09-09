'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  const path = usePathname()
  const active = href === '/' ? path === '/' || path.startsWith('/invoices') : path.startsWith(href)
  return (
    <Link href={href} className={`rounded-md px-3 py-1.5 transition ${className} ${active ? 'bg-tint font-medium text-brand-deep' : 'text-ink-soft hover:bg-tint hover:text-ink'}`}>
      {children}
    </Link>
  )
}
