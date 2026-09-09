'use client'
import { usePathname } from 'next/navigation'

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <details key={path} className="lg:hidden">
      <summary aria-label="Menu" className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md hover:bg-tint [&::-webkit-details-marker]:hidden">
        <span className="block h-0.5 w-5 bg-ink shadow-[0_-6px_0_0_#0f2a52,0_6px_0_0_#0f2a52]" />
      </summary>
      <div className="absolute inset-x-0 top-full z-10 flex flex-col gap-1 border-b border-line bg-paper p-3 text-base shadow-sm">{children}</div>
    </details>
  )
}
