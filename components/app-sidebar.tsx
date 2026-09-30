'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, CircleHelp, FileCheck2, House, LogOut, Package, Palette, ReceiptText, Settings, ShoppingBag, Truck, Users, Wallet, type LucideIcon } from 'lucide-react'
import { logout } from '@/app/login/actions'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from '@/components/ui/sidebar'

type Item = { href: string; label: string; icon: LucideIcon }
// Grouped by the job she is doing, in the order work flows: quote, bill, deliver, buy, get paid.
export const NAV: { label?: string; items: Item[] }[] = [
  { items: [{ href: '/', label: 'Home', icon: House }] },
  { label: 'Sell', items: [
    { href: '/quotations', label: 'Quotations', icon: FileCheck2 },
    { href: '/invoices', label: 'Invoices', icon: ReceiptText },
    { href: '/challans', label: 'Delivery challans', icon: Truck },
  ] },
  { label: 'Buy', items: [{ href: '/purchases', label: 'Purchase bills', icon: ShoppingBag }] },
  { label: 'Money', items: [{ href: '/outstanding', label: 'Outstanding', icon: Wallet }] },
  { label: 'Records', items: [
    { href: '/products', label: 'Products', icon: Package },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/vendors', label: 'Vendors', icon: Building2 },
  ] },
]
const FOOTER: Item[] = [
  { href: '/help', label: 'Help', icon: CircleHelp },
  { href: '/design-system', label: 'Design system', icon: Palette },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppSidebar() {
  const path = usePathname()
  const { setOpenMobile } = useSidebar()
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))
  const link = (i: Item) => (
    <SidebarMenuItem key={i.href}>
      <SidebarMenuButton asChild isActive={active(i.href)} tooltip={i.label}>
        <Link href={i.href} onClick={() => setOpenMobile(false)}><i.icon /><span>{i.label}</span></Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
  return (
    <Sidebar collapsible="icon" variant="inset">
      <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <Image src="/icon.png" alt="" width={32} height={32} className="size-8 shrink-0" />
                <span className="grid leading-tight"><span className="font-heading font-semibold">KlevenBook</span><span className="text-xs text-muted-foreground">Kleven Care</span></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((g) => (
          <SidebarGroup key={g.label ?? 'home'}>
            {g.label && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent><SidebarMenu>{g.items.map(link)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {FOOTER.map(link)}
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Sign out"><LogOut /><span>Sign out</span></SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      </nav>
      <SidebarRail />
    </Sidebar>
  )
}

// The name of the section being viewed, for the top bar.
export function SectionName() {
  const path = usePathname()
  const all = [...NAV.flatMap((g) => g.items), ...FOOTER]
  const hit = all.filter((i) => (i.href === '/' ? path === '/' : path.startsWith(i.href))).sort((a, b) => b.href.length - a.href.length)[0]
  return <span className="truncate text-sm font-medium">{hit?.label ?? 'KlevenBook'}</span>
}
