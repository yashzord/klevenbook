import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Building2, Check, FileCheck2, House, Package, ReceiptText, ShoppingBag, TriangleAlert, Truck, Users, Wallet, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STATUS_LABEL, STATUS_VARIANT, type PayStatus } from '@/lib/payments'
import { amount, inr } from '@/lib/gst'
import { Stat } from '@/components/stat'
import { ButtonDemos, FormDemos, Swatch } from './demos'

export const metadata: Metadata = { title: 'Design system' }
// Built once at deploy time. Tokens are read from app/globals.css, so this page cannot disagree with the app.
export const dynamic = 'force-static'

type Token = { name: string; hex: string; note: string }

function readTokens(): Token[] {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')
  const root = css.slice(css.indexOf(':root {'), css.indexOf('@theme inline'))
  return [...root.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g)].map((m) => ({ name: m[1], hex: m[2].toLowerCase(), note: m[3] ?? '' }))
}

// WCAG 2 contrast ratio: https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((hi + 0.05) / (lo + 0.05)).toFixed(1)
}

const SECTIONS = [
  ['foundation', 'Foundation'], ['brand', 'Brand'], ['color', 'Color'], ['typography', 'Typography'], ['components', 'Components'], ['patterns', 'Patterns'],
  ['documents', 'Printed documents'], ['shape', 'Shape and space'], ['motion', 'Motion'], ['voice', 'Voice'],
] as const

const GROUPS: { title: string; blurb: string; names: string[] }[] = [
  { title: 'Brand', blurb: 'From the Kleven Care logo. Navy is text, Kleven blue is the one main action on a screen, green means money in or done.', names: ['foreground', 'primary', 'ring', 'success', 'brand-green'] },
  { title: 'Surfaces', blurb: 'A white page on a faintly blue backdrop. Fills get darker only as things become more interactive.', names: ['background', 'sidebar', 'muted', 'secondary', 'accent', 'border', 'input'] },
  { title: 'Status', blurb: 'Always paired with a word. Color never carries the meaning alone.', names: ['success', 'warning', 'destructive', 'muted-foreground'] },
  { title: 'Third party', blurb: 'Only on the Send on WhatsApp button, with navy text.', names: ['whatsapp'] },
]

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t pt-10 first:border-t-0 first:pt-0">
      <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-muted-foreground">{lead}</p>
      {children}
    </section>
  )
}
function Panel({ label, children, className = '' }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <CardContent>
        {label && <p className="mb-1 text-xs text-muted-foreground">{label}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
const Code = ({ children }: { children: React.ReactNode }) => <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>

export default function DesignSystemPage() {
  const tokens = readTokens()
  const by = Object.fromEntries(tokens.map((t) => [t.name, t]))
  const hex = (n: string) => by[n]?.hex ?? '#000000'
  // Which text sits on which background in the app, so the ratio shown is the one that matters.
  const pair: Record<string, [string, string, string]> = {
    foreground: [hex('foreground'), hex('background'), 'text on the page'],
    primary: [hex('primary-foreground'), hex('primary'), 'white text on it'],
    ring: [hex('ring'), hex('background'), 'focus ring on the page'],
    success: [hex('success'), hex('background'), 'text on the page'],
    warning: [hex('warning'), hex('background'), 'text on the page'],
    destructive: [hex('destructive'), hex('background'), 'text on the page'],
    'muted-foreground': [hex('muted-foreground'), hex('muted'), 'text on a muted fill'],
    whatsapp: [hex('foreground'), hex('whatsapp'), 'navy text on it'],
  }
  const statuses: PayStatus[] = ['paid', 'part', 'unpaid', 'cancelled']

  return (
    <div className="min-h-screen bg-sidebar">
      <div className="rule-brand" />
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2.5 mb-3 text-muted-foreground"><Link href="/"><ArrowLeft /> KlevenBook</Link></Button>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">KlevenBook design system</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">The tokens, components and rules behind every KlevenBook screen and every printed document. Built for one job: a small distributor gets an invoice right the first time, on a laptop or a phone.</p>
          </div>
          <Image src="/icon.png" alt="" width={56} height={56} className="hidden shrink-0 sm:block" />
        </header>

        <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
          <nav aria-label="Sections" className="top-6 flex h-fit flex-wrap gap-1 text-sm lg:sticky lg:flex-col">
            {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-md px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">{label}</a>)}
          </nav>

          <main className="min-w-0 space-y-10">
            <Section id="foundation" title="Foundation" lead="KlevenBook is built on shadcn/ui. The components are copied into the repo and themed with Kleven Care's colors, so they can be read, changed and owned like any other file.">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Components', 'shadcn/ui, style radix-vega', <>In <Code>components/ui/</Code>. Add one with <Code>npx shadcn@latest add name</Code>.</>],
                  ['Theme', 'CSS variables, Tailwind 4', <>One block in <Code>app/globals.css</Code>. This page reads it at build time, so the swatches below are the live values.</>],
                  ['Icons and type', 'Lucide, IBM Plex Sans', <>Icons from <Code>lucide-react</Code> at a 1.5 to 2px stroke. One font family across screens and paper.</>],
                ].map(([t, sub, body]) => (
                  <Card key={t as string} size="sm"><CardHeader><CardDescription>{t}</CardDescription><CardTitle>{sub}</CardTitle></CardHeader><CardContent className="text-muted-foreground">{body}</CardContent></Card>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Three things differ from stock shadcn, all on purpose: controls are 40px tall for phone use, badges and alerts gain success and warning variants, and there is no dark theme because documents print.</p>
            </Section>

            <Section id="brand" title="Brand" lead="The Kleven Care mark is a K formed by a blue upright and a green stroke, with a figure reaching up between them: care for people, delivered with precision.">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="grid gap-4">
                  <Panel className="items-center py-10"><Image src="/logo.png" alt="Kleven Care logo" width={180} height={180} className="mx-auto" /></Panel>
                  <div className="grid grid-cols-2 gap-4">
                    <Panel label="App icon"><Image src="/icon.png" alt="" width={56} height={56} /></Panel>
                    <Panel label="Clear space"><p>Keep the width of the K&apos;s upright free on every side. Place the logo on white only, never on navy, green or a photo.</p></Panel>
                  </div>
                  <Panel label="Brand rule. The 4px sweep at the top of the app and under every letterhead."><div className="rule-brand rounded" /></Panel>
                </div>
                <dl className="space-y-5">
                  {[
                    ['Right the first time', 'Tax is worked out for her, dates are picked from a calendar with month names, and anything unusual is flagged before saving, not after.'],
                    ['Plain words', 'The screen says what a thing is and what a button does. No accounting jargon, no error codes.'],
                    ['Paper is the product', 'Customers see the printed document, not the app. It must look like a letterhead and print cleanly on A4.'],
                  ].map(([t, d]) => (
                    <div key={t} className="border-l-2 border-primary pl-4"><dt className="font-heading font-medium">{t}</dt><dd className="mt-1 text-sm text-muted-foreground">{d}</dd></div>
                  ))}
                </dl>
              </div>
            </Section>

            <Section id="color" title="Color" lead="shadcn's semantic tokens, filled with the logo's colors. Every text and background pair meets WCAG AA, 4.5 to 1 or better. Click a swatch to copy its value.">
              <div className="space-y-6">
                {GROUPS.map((g) => (
                  <div key={g.title}>
                    <p className="mb-2 text-sm"><span className="font-medium">{g.title}.</span> <span className="text-muted-foreground">{g.blurb}</span></p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {g.names.filter((n) => by[n]).map((n) => (
                        <Swatch key={n} name={n} hex={by[n].hex} note={by[n].note} contrast={pair[n] ? `${contrast(pair[n][0], pair[n][1])}:1 ${pair[n][2]}` : undefined} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="typography" title="Typography" lead="One family, IBM Plex Sans, in three weights. It was drawn for forms and figures, which is what this app is. Numerals are tabular everywhere, so money lines up in columns.">
              <Card className="gap-0 py-0">
                <div className="divide-y">
                  {[
                    ['Headline', '36 / 600, tight', 'font-heading text-4xl font-semibold tracking-tight', 'Invoices that are right the first time.', 'Sign-in page only'],
                    ['Page title', '24 / 600, tight', 'font-heading text-2xl font-semibold tracking-tight', 'New invoice', 'One per screen'],
                    ['Figure', '24 / 600 tabular', 'font-heading text-2xl font-semibold tracking-tight tabular-nums', inr(74245.5), 'Totals and summary cards'],
                    ['Card title', '16 / 500', 'font-heading text-base font-medium', 'Getting started', 'Card and dialog headings'],
                    ['Body', '14 / 400', 'text-sm', 'Pick the customer, add lines, and print or save it as a PDF.', 'Tables, forms, help'],
                    ['Label', '14 / 500', 'text-sm font-medium', 'Invoice date', 'Field labels, table headings'],
                    ['Hint', '12 / 400', 'text-xs text-muted-foreground', 'Wednesday, 30 September 2026', 'Under a field, inside badges'],
                  ].map(([role, spec, cls, sample, use]) => (
                    <div key={role} className="grid items-baseline gap-2 px-6 py-4 sm:grid-cols-[150px_1fr_190px]">
                      <div><p className="text-sm font-medium">{role}</p><p className="text-xs text-muted-foreground">{spec}</p></div>
                      <p className={cls}>{sample}</p>
                      <p className="text-xs text-muted-foreground">{use}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section id="components" title="Components" lead="shadcn/ui components, themed. All are reachable by keyboard with a visible blue focus ring. One filled blue button per screen; everything else is outlined or plain.">
              <div className="grid gap-4">
                <Panel label="Button. Six variants, three sizes. Press Save changes to see the waiting state and Delete to see the confirm dialog."><div className="pt-2"><ButtonDemos /></div></Panel>
                <Panel label="Fields. Label above, hint below, one message in plain words. Product is a searchable Combobox; the date opens a Calendar and warns when the day is far from today."><div className="pt-2"><FormDemos /></div></Panel>
                <div className="grid gap-4 md:grid-cols-2">
                  <Panel label="Badge. Status always comes with a word.">
                    <div className="flex flex-wrap gap-2 pt-2">
                      {statuses.map((s) => <Badge key={s} variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge>)}
                      <Badge variant="destructive">Overdue</Badge>
                      <Badge variant="warning">Missing</Badge>
                      <Badge variant="secondary">Hidden</Badge>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                  </Panel>
                  <Panel label="Skeleton. Stands in for a page while it loads.">
                    <div className="space-y-2 pt-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-64 max-w-full" /><Skeleton className="h-16 w-full" /></div>
                  </Panel>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Panel label="Alert. Four kinds, shown next to what caused them.">
                    <div className="grid gap-2 pt-2">
                      <Alert variant="success"><Check /><AlertDescription>Settings saved.</AlertDescription></Alert>
                      <Alert variant="warning"><TriangleAlert /><AlertDescription>5 lines have no HSN code. B2B invoices need one.</AlertDescription></Alert>
                      <Alert variant="destructive"><X /><AlertDescription>Row 2: enter the rate from the vendor&apos;s bill.</AlertDescription></Alert>
                      <Alert variant="info"><AlertDescription>Started from KC-Q-2026-0001. Lines are copied in.</AlertDescription></Alert>
                    </div>
                  </Panel>
                  <Panel label="Sidebar. Grouped by the job being done, in the order work flows. Collapses to icons, and to a slide-over on phones.">
                    <div className="mt-2 w-full max-w-56 rounded-lg bg-sidebar p-2 text-sm">
                      <p className="flex items-center gap-2 rounded-md px-2 py-1.5"><House className="size-4" /> Home</p>
                      <p className="px-2 pt-2 pb-1 text-xs text-muted-foreground">Sell</p>
                      <p className="flex items-center gap-2 rounded-md px-2 py-1.5"><FileCheck2 className="size-4" /> Quotations</p>
                      <p className="flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 font-medium"><ReceiptText className="size-4" /> Invoices</p>
                      <p className="flex items-center gap-2 rounded-md px-2 py-1.5"><Truck className="size-4" /> Delivery challans</p>
                      <p className="flex flex-wrap gap-x-4 gap-y-1 px-2 pt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><ShoppingBag className="size-3.5" /> Buy</span><span className="flex items-center gap-1"><Wallet className="size-3.5" /> Money</span><span className="flex items-center gap-1"><Package className="size-3.5" /><Users className="size-3.5" /><Building2 className="size-3.5" /> Records</span></p>
                    </div>
                  </Panel>
                </div>
              </div>
            </Section>

            <Section id="patterns" title="Patterns" lead="How the components combine on a real screen. An empty screen always says what to do next, and the next step is the only filled button.">
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Customers owe you" value={inr(409.5)} note="1 unpaid invoice" href="#patterns" />
                  <Stat label="Overdue" value={inr(409.5)} note="1 past the pay-by date" tone="text-destructive" />
                  <Stat label="You owe vendors" value={inr(0)} note="0 unpaid bills" tone="text-muted-foreground" />
                </div>
                <Card className="gap-0 py-0">
                  <p className="px-6 pt-4 pb-3 text-xs text-muted-foreground">Data table. Muted header, numbers right-aligned, the document number is the link, status as a badge.</p>
                  <Table>
                    <TableHeader className="bg-muted"><TableRow><TableHead className="px-6">Number</TableHead><TableHead className="px-6">Date</TableHead><TableHead className="px-6">Customer</TableHead><TableHead className="px-6 text-right">Total</TableHead><TableHead className="px-6">Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {([['KC-INV-2026-0002', '28 Sept 2026', 'Vedanta Hospitals', 6490, 'unpaid'], ['KC-INV-2026-0001', '20 Sept 2026', 'Aadithya Industries', 74245.5, 'paid']] as const).map(([n, d, c, t, s]) => (
                        <TableRow key={n}>
                          <TableCell className="px-6 py-3 font-medium text-primary">{n}</TableCell><TableCell className="px-6">{d}</TableCell><TableCell className="px-6">{c}</TableCell>
                          <TableCell className="px-6 text-right tabular-nums">{inr(t)}</TableCell>
                          <TableCell className="px-6"><Badge variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <Panel label="Empty. Says what is missing and links to the next step.">
                    <Empty className="mt-2 border p-6">
                      <EmptyHeader><EmptyTitle>No quotations yet</EmptyTitle><EmptyDescription>You need a product and a customer first, then create one.</EmptyDescription></EmptyHeader>
                      <EmptyContent className="flex-row justify-center"><Button variant="outline" size="sm">Products</Button><Button variant="outline" size="sm">Customers</Button></EmptyContent>
                    </Empty>
                  </Panel>
                  <Panel label="Checklist. Ticks itself from real data; only the next step gets the filled button.">
                    <ol className="mt-2 divide-y rounded-lg border text-sm">
                      <li className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground"><span className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="size-3.5" /></span><span className="line-through">Add your business details</span></li>
                      <li className="flex items-center gap-3 px-3 py-2"><span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span><span className="flex-1 font-medium">Add your bank details</span><Button size="sm">Do this next</Button></li>
                    </ol>
                  </Panel>
                </div>
              </div>
            </Section>

            <Section id="documents" title="Printed documents" lead="Quotations, invoices, delivery challans and purchase bills share one letterhead layout on A4. This is what customers actually see, so it follows stricter rules than the screens.">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <Image src="/logo.png" alt="" width={64} height={64} />
                    <div className="text-right"><p className="font-heading text-lg font-semibold">Kleven Care</p><p className="text-xs text-muted-foreground">Alkapur Township, Hyderabad<br />GSTIN 36AVUPB6080GIZC</p></div>
                  </div>
                  <div className="rule-brand my-3" />
                  <p className="mb-2 text-right text-xs tracking-wide text-muted-foreground uppercase">Original for recipient</p>
                  <div className="flex items-end justify-between"><p className="font-heading text-base font-semibold">Tax invoice</p><p className="text-xs"><span className="text-muted-foreground">Invoice number</span> <span className="font-medium">KC-INV-2026-0001</span></p></div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs tabular-nums">
                      <thead className="border-b-2 border-foreground text-left text-muted-foreground"><tr><th className="py-1.5 pr-2 font-medium">S.No</th><th className="py-1.5 pr-2 font-medium">Description</th><th className="py-1.5 pr-2 font-medium">HSN/SAC</th><th className="py-1.5 pr-2 text-right font-medium">Qty</th><th className="py-1.5 pr-2 text-right font-medium">Unit price</th><th className="py-1.5 pr-2 text-right font-medium">IGST</th><th className="py-1.5 text-right font-medium">Total</th></tr></thead>
                      <tbody><tr className="border-b"><td className="py-1.5 pr-2 text-muted-foreground">1</td><td className="py-1.5 pr-2">Nebuliser Kit with T-connector</td><td className="py-1.5 pr-2">9019</td><td className="py-1.5 pr-2 text-right">30 Nos</td><td className="py-1.5 pr-2 text-right">{amount(115)}</td><td className="py-1.5 pr-2 text-right">{amount(172.5)}<span className="block text-muted-foreground">5%</span></td><td className="py-1.5 text-right font-medium">{amount(3622.5)}</td></tr></tbody>
                    </table>
                  </div>
                  <div className="mt-3 rounded-md border-2 border-destructive px-3 py-2 text-destructive"><p className="text-sm font-semibold tracking-wide uppercase">Cancelled</p><p className="text-xs">30 Sept 2026. Wrong quantity, reissued.</p></div>
                </Panel>
                <Panel>
                  <ul className="space-y-3">
                    {[
                      ['Letterhead', 'Logo left, business name, address and GSTIN right, then the brand rule.'],
                      ['Columns', 'S.No, Description, HSN/SAC, Qty, Unit price, Tax, Total. The tax column is headed with the tax charged.'],
                      ['Amounts', 'Plain numbers with Indian grouping, 74,245.50. No rupee sign on paper; screens keep it.'],
                      ['Numbers', 'Prefix plus a four-digit counter, KC-INV-2026-0001. One series per document type. A number is never reused.'],
                      ['Cancelled', 'A red stamp with the date and reason. The document keeps its number and stays in the list.'],
                      ['Hidden on paper', 'The sidebar, buttons and the payments card never print.'],
                    ].map(([t, d]) => <li key={t}><span className="font-medium">{t}.</span> <span className="text-muted-foreground">{d}</span></li>)}
                  </ul>
                </Panel>
              </div>
            </Section>

            <Section id="shape" title="Shape and space" lead="A 4px grid. Cards are white with a hairline ring and the faintest shadow; importance is shown by position and weight, not by depth.">
              <div className="grid gap-4 md:grid-cols-3">
                <Panel label="Corner radius, from --radius 10px">
                  <ul className="space-y-3 pt-2">
                    {[['rounded-md', '8px', 'Buttons, inputs'], ['rounded-lg', '10px', 'Alerts, menus, lists'], ['rounded-xl', '14px', 'Cards, the page sheet'], ['rounded-full', 'full', 'Badges, checklist dots']].map(([cls, px, use]) => (
                      <li key={cls} className="flex items-center gap-3"><span className={`size-9 shrink-0 border border-primary bg-accent ${cls}`} /><span><Code>{cls}</Code> <span className="text-muted-foreground">{px}. {use}</span></span></li>
                    ))}
                  </ul>
                </Panel>
                <Panel label="Spacing">
                  <ul className="space-y-2 pt-2">
                    {[[8, 'Between buttons'], [16, 'Between fields, card grid gap'], [24, 'Card padding, between cards'], [32, 'Page padding on a laptop'], [40, 'Height of inputs and buttons'], [44, 'Height of the large button']].map(([px, use]) => (
                      <li key={px} className="flex items-center gap-3"><span className="w-10 shrink-0 text-xs text-muted-foreground">{px}px</span><span className="h-3 shrink-0 rounded-sm bg-primary" style={{ width: Number(px) * 2 }} /><span className="text-xs text-muted-foreground">{use}</span></li>
                    ))}
                  </ul>
                </Panel>
                <Panel label="Layout">
                  <ul className="space-y-2 pt-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Sidebar 256px</span>, 48px when collapsed to icons</li>
                    <li><span className="font-medium text-foreground">Content 1024px</span> on a white sheet inset from the backdrop</li>
                    <li><span className="font-medium text-foreground">Paper 210mm</span>, A4 with 14mm margins</li>
                    <li><span className="font-medium text-foreground">Under 768px</span> the sidebar becomes a slide-over and form rows stack</li>
                    <li><span className="font-medium text-foreground">Light only</span>, because documents print</li>
                  </ul>
                </Panel>
              </div>
            </Section>

            <Section id="motion" title="Motion" lead="Motion only confirms that something happened. Nothing moves for decoration, and everything stops for people who ask their device to reduce motion.">
              <Card className="gap-0 py-0">
                <div className="divide-y">
                  {[
                    ['Hover and press', '150ms', 'Color fades on buttons, links and rows. Buttons dip 1px when pressed'],
                    ['Menus and dialogs', '150 to 200ms', 'Popovers, the calendar, dialogs and the phone sidebar fade and scale in from where they were opened'],
                    ['Waiting', 'spinner', 'A button shows a spinner and its waiting word, and cannot be pressed twice'],
                    ['Page change', 'pulse', 'Skeleton blocks stand in for the page while it loads'],
                    ['Sign-in headline', '700ms once', 'Rises into place on first load. The only entrance animation in the app'],
                  ].map(([what, time, where]) => (
                    <div key={what} className="grid gap-1 px-6 py-3 text-sm sm:grid-cols-[180px_130px_1fr]"><span className="font-medium">{what}</span><span><Code>{time}</Code></span><span className="text-muted-foreground">{where}</span></div>
                  ))}
                </div>
              </Card>
            </Section>

            <Section id="voice" title="Voice" lead="Write the way a careful colleague would explain it across the counter: specific, calm, and in words a shop owner uses.">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Save changes', 'Submit'],
                  ['That email and password do not match. Check both and try again.', 'Invalid credentials.'],
                  ['There are documents for this name, so it cannot be deleted. Press Hide instead.', 'Error 23503: foreign key violation.'],
                  ['No invoices yet. You need a product and a customer first.', 'No data.'],
                  ['Saturday, 9 May 2026. That is 144 days ago; check the month.', 'Warning: date out of range.'],
                ].flatMap(([good, bad]) => [
                  <Alert key={good} variant="success"><Check /><AlertDescription>{good}</AlertDescription></Alert>,
                  <Alert key={bad} variant="destructive"><X /><AlertDescription>{bad}</AlertDescription></Alert>,
                ])}
              </div>
              <ul className="mt-5 space-y-1 text-sm text-muted-foreground">
                <li>Buttons say what they do, and the same action keeps the same name everywhere.</li>
                <li>Errors say what went wrong and what to do next. They never apologise and never show a code.</li>
                <li>Sentence case throughout. Dates as 30 Sept 2026. Money as {inr(74245.5)} on screen and {amount(74245.5)} on paper.</li>
              </ul>
            </Section>
          </main>
        </div>
      </div>
    </div>
  )
}
