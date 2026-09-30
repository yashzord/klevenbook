import { AppSidebar, SectionName } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

// shadcn Sidebar, inset variant: navigation on the tinted backdrop, the page on a white sheet.
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow">Skip to content</a>
        <AppSidebar />
        <SidebarInset>
          <div className="rule-brand no-print rounded-t-xl" />
          <header className="no-print flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
            <SectionName />
          </header>
          {/* SidebarInset is the <main> landmark, so this is a plain container. Pages with a side-by-side preview mark themselves data-wide. */}
          <div id="main" className="@container/page mx-auto w-full max-w-5xl p-4 has-data-wide:max-w-[1500px] sm:p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
