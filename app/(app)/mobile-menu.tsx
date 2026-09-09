'use client'
import { usePathname } from 'next/navigation'
import { IconMenu } from '@/components/icons'

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <details key={path} className="lg:hidden">
      <summary aria-label="Menu" className="flex h-11 w-11 list-none items-center justify-center rounded-md transition hover:bg-tint [&::-webkit-details-marker]:hidden">
        <IconMenu />
      </summary>
      <div className="absolute inset-x-0 top-full z-10 flex flex-col gap-1 border-b border-line bg-paper p-3 text-base shadow-sm [&_a]:py-3 [&_button]:py-3">{children}</div>
    </details>
  )
}
