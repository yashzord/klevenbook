import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import Image from 'next/image'
import { IconArrowLeft, IconCheck, IconMenu, IconPlus, IconX } from '@/components/icons'
import { STATUS_CLASS, STATUS_LABEL, type PayStatus } from '@/lib/payments'
import { amount, inr } from '@/lib/gst'
import { ButtonDemos, FormDemos, Swatch } from './demos'

export const metadata: Metadata = { title: 'Design system' }
// Built once at deploy time. Colors are read from app/globals.css, so this page cannot disagree with the app.
export const dynamic = 'force-static'

type Token = { name: string; hex: string; note: string }

function readTokens(): Token[] {
  const css = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf8')
  return [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6});[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g)].map((m) => ({ name: m[1], hex: m[2].toLowerCase(), note: m[3] ?? '' }))
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
  ['brand', 'Brand'], ['color', 'Color'], ['typography', 'Typography'], ['components', 'Components'], ['patterns', 'Patterns'],
  ['documents', 'Printed documents'], ['shape', 'Shape and space'], ['motion', 'Motion'], ['voice', 'Voice'],
] as const

const GROUPS: { title: string; blurb: string; names: string[] }[] = [
  { title: 'Brand', blurb: 'Taken from the Kleven Care logo. Navy carries text, blue carries links, green carries the one main action on a screen.', names: ['ink', 'brand-deep', 'brand', 'leaf', 'leaf-deep', 'leaf-bright'] },
  { title: 'Neutrals', blurb: 'Everything else stays quiet so amounts and statuses can be read at a glance.', names: ['ink-soft', 'line', 'tint', 'canvas', 'paper'] },
  { title: 'Third party', blurb: 'Used only on the Send on WhatsApp button, with navy text.', names: ['whatsapp'] },
]

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-line pt-10 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mb-6 mt-1 max-w-2xl text-sm text-ink-soft">{lead}</p>
      {children}
    </section>
  )
}
const Panel = ({ label, children, className = '' }: { label?: string; children: React.ReactNode; className?: string }) => (
  <div className={`min-w-0 rounded-lg border border-line bg-paper p-4 ${className}`}>
    {label && <p className="mb-3 text-xs text-ink-soft">{label}</p>}
    {children}
  </div>
)
const Code = ({ children }: { children: React.ReactNode }) => <code className="rounded bg-tint px-1 py-0.5 text-xs">{children}</code>

export default function DesignSystemPage() {
  const tokens = readTokens()
  const by = Object.fromEntries(tokens.map((t) => [t.name, t]))
  const hex = (n: string) => by[n]?.hex ?? '#000000'
  // Which text sits on which background in the app, so the ratio shown is the one that matters.
  const pair: Record<string, [string, string, string]> = {
    ink: [hex('ink'), hex('paper'), 'text on paper'], 'ink-soft': [hex('ink-soft'), hex('paper'), 'text on paper'],
    brand: [hex('brand'), hex('paper'), 'link on paper'], 'brand-deep': [hex('brand-deep'), hex('tint'), 'text on tint'],
    leaf: ['#ffffff', hex('leaf'), 'white text on it'], 'leaf-deep': [hex('leaf-deep'), hex('paper'), 'text on paper'],
    whatsapp: [hex('ink'), hex('whatsapp'), 'navy text on it'],
  }
  const statuses: PayStatus[] = ['paid', 'part', 'unpaid', 'cancelled']

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="rule-brand mb-8 rounded" />
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">KlevenBook design system</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">The tokens, components and rules behind every KlevenBook screen and every printed document. Built for one job: a small distributor gets an invoice right the first time, on a laptop or a phone.</p>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">Colors on this page are read from <Code>app/globals.css</Code> and the components are the real ones from <Code>components/</Code>, so this page always matches the app.</p>
        </div>
        <Image src="/icon.png" alt="" width={56} height={56} className="hidden shrink-0 sm:block" />
      </header>

      <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
        <nav aria-label="Sections" className="top-6 flex h-fit flex-wrap gap-1 text-sm lg:sticky lg:flex-col lg:border-l lg:border-line">
          {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-md px-3 py-2 text-ink-soft transition hover:bg-tint hover:text-ink">{label}</a>)}
        </nav>

        <div className="min-w-0 space-y-10">
          <Section id="brand" title="Brand" lead="The Kleven Care mark is a K formed by a navy-blue upright and a green stroke, with a figure reaching up between them: care for people, delivered with precision.">
            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <div className="grid gap-4">
                <Panel className="flex items-center justify-center py-8"><Image src="/logo.png" alt="Kleven Care logo" width={180} height={180} /></Panel>
                <div className="grid grid-cols-2 gap-4">
                  <Panel label="App icon" className="flex flex-col items-center"><Image src="/icon.png" alt="" width={56} height={56} /></Panel>
                  <Panel label="Clear space"><p className="text-sm">Keep the width of the K&apos;s upright free on every side. Place the logo on white only, never on navy, green or a photo.</p></Panel>
                </div>
                <Panel label="Brand rule, the 4px line at the top of every screen and under every letterhead"><div className="rule-brand rounded" /></Panel>
              </div>
              <dl className="space-y-5">
                {[
                  ['Right the first time', 'Tax is worked out for her, the picked date is spelled out, and anything unusual is flagged before saving, not after.'],
                  ['Plain words', 'The screen says what a thing is and what a button does. No accounting jargon, no error codes.'],
                  ['Paper is the product', 'Customers see the printed document, not the app. It must look like a letterhead and print cleanly on A4.'],
                ].map(([t, d]) => (
                  <div key={t} className="border-l-2 border-leaf pl-4"><dt className="font-medium">{t}</dt><dd className="mt-1 text-sm text-ink-soft">{d}</dd></div>
                ))}
              </dl>
            </div>
          </Section>

          <Section id="color" title="Color" lead="Every text and background pair meets WCAG AA, 4.5 to 1 or better. The bright logo green fails that with white text, so it is decoration only. Click a swatch to copy its hex.">
            <div className="space-y-6">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="mb-2 text-sm"><span className="font-medium">{g.title}</span> <span className="text-ink-soft">{g.blurb}</span></p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {g.names.filter((n) => by[n]).map((n) => (
                      <Swatch key={n} name={n} hex={by[n].hex} note={by[n].note} contrast={pair[n] ? `${contrast(pair[n][0], pair[n][1])}:1 ${pair[n][2]}` : undefined} />
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <p className="mb-2 text-sm"><span className="font-medium">Status</span> <span className="text-ink-soft">Always a word on a tinted chip, never color alone.</span></p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Done, paid, saved', 'border-leaf/40 bg-leaf/10 text-leaf-deep', 'bg-leaf/10 text-leaf-deep'],
                    ['Needs a look: part paid, missing HSN, odd date', 'border-amber-200 bg-amber-50 text-amber-900', 'bg-amber-50 text-amber-900'],
                    ['Stopped: error, overdue, cancelled, delete', 'border-red-200 bg-red-50 text-red-800', 'bg-red-50 text-red-800'],
                    ['Neutral: unpaid, selected, table head', 'border-line bg-tint text-brand-deep', 'bg-tint text-brand-deep'],
                  ].map(([label, cls, code]) => (
                    <div key={label} className={`rounded-md border px-3 py-2 text-sm ${cls}`}>{label}<span className="mt-1 block text-xs opacity-80">{code}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="typography" title="Typography" lead="One family, IBM Plex Sans, in three weights. Numerals are tabular everywhere, so money lines up in columns. Body text is never smaller than 12px.">
            <Panel className="divide-y divide-line p-0">
              {[
                ['Headline', '36 / 600', 'text-4xl font-semibold', 'Invoices that are right the first time.', 'Sign-in page only'],
                ['Page title', '24 / 600', 'text-2xl font-semibold', 'New invoice', 'One per screen'],
                ['Document title', '20 / 600', 'text-xl font-semibold', 'Tax invoice', 'Printed documents, section heads here'],
                ['Panel heading', '16 / 600', 'font-semibold', 'Getting started', 'Inside panels'],
                ['Body', '14 / 400', 'text-sm', 'Pick the customer, add lines, and print or save it as a PDF.', 'Tables, forms, help'],
                ['Hint', '12 / 400', 'text-xs text-ink-soft', 'Wednesday, 30 September 2026', 'Under a field, inside chips'],
                ['Money', '14 / 500 tabular', 'text-sm font-medium tabular-nums', `${amount(74245.5)}   ${amount(1850.5)}   ${amount(78)}`, 'Right-aligned in tables'],
              ].map(([role, spec, cls, sample, use]) => (
                <div key={role} className="grid items-baseline gap-2 px-4 py-4 sm:grid-cols-[150px_1fr_180px]">
                  <div><p className="text-sm font-medium">{role}</p><p className="text-xs text-ink-soft">{spec}</p></div>
                  <p className={`${cls} whitespace-pre-wrap`}>{sample}</p>
                  <p className="text-xs text-ink-soft">{use}</p>
                </div>
              ))}
            </Panel>
          </Section>

          <Section id="components" title="Components" lead="The building blocks on every screen. All are reachable by keyboard with a visible blue focus ring, and every input and button is 44px tall so it is easy to tap on a phone.">
            <div className="grid gap-4">
              <Panel label="Buttons. One green primary action per screen; everything else is outlined or plain. Press Save changes to see the waiting state, and Delete to see the two-step confirm."><ButtonDemos /></Panel>
              <Panel label="Form fields. Label above, hint below, one error message in plain words. The date field spells the date out and warns when it is far from today."><FormDemos /></Panel>
              <div className="grid gap-4 md:grid-cols-2">
                <Panel label="Status chips, always with a word">
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((s) => <span key={s} className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>)}
                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">Overdue</span>
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-900">Missing</span>
                    <span className="rounded bg-tint px-1.5 py-0.5 text-xs">Hidden</span>
                  </div>
                </Panel>
                <Panel label="Icons. Inline SVG outlines, 1.5px stroke, from components/icons.tsx. Never emoji or text characters.">
                  <div className="flex flex-wrap items-center gap-5 text-ink-soft">
                    {[[IconPlus, 'Add'], [IconX, 'Remove'], [IconCheck, 'Done'], [IconArrowLeft, 'Back'], [IconMenu, 'Menu']].map(([Icon, label]) => {
                      const I = Icon as typeof IconPlus
                      return <span key={label as string} className="flex flex-col items-center gap-1 text-xs"><I className="h-6 w-6 text-ink" />{label as string}</span>
                    })}
                  </div>
                </Panel>
              </div>
              <Panel label="Navigation. The current section sits on a tint fill. On a phone the links fold into a menu button.">
                <div className="flex flex-wrap items-center gap-0.5 text-sm">
                  <span className="rounded-md bg-tint px-2.5 py-1.5 font-medium text-brand-deep">Invoices</span>
                  {['Quotations', 'Challans', 'Purchases', 'Outstanding'].map((l) => <span key={l} className="rounded-md px-2.5 py-1.5 text-ink-soft">{l}</span>)}
                </div>
              </Panel>
            </div>
          </Section>

          <Section id="patterns" title="Patterns" lead="How the components combine. Problems are shown next to the thing that caused them, and an empty screen always says what to do next.">
            <div className="grid gap-4">
              <Panel label="Messages. One per form, under the fields.">
                <div className="grid gap-3 md:grid-cols-2">
                  <p role="status" className="rounded-md border border-leaf/40 bg-leaf/10 px-3 py-2 text-sm text-leaf-deep">Settings saved.</p>
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">Row 2: enter the rate from the vendor&apos;s bill.</p>
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">5 lines have no HSN code. B2B invoices need one.</p>
                  <p className="rounded-md bg-tint px-3 py-2 text-sm">Started from KC-Q-2026-0001. Lines are copied in; change anything before saving.</p>
                </div>
              </Panel>
              <Panel label="Data table. Tint header, numbers right-aligned, the number is the link, status as a chip." className="p-0 [&>p]:px-4 [&>p]:pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-tint text-left text-ink-soft"><tr><th className="px-4 py-2 font-medium">Number</th><th className="px-4 py-2 font-medium">Date</th><th className="px-4 py-2 font-medium">Customer</th><th className="px-4 py-2 text-right font-medium">Total</th><th className="px-4 py-2 font-medium">Status</th></tr></thead>
                    <tbody>
                      {([['KC-INV-2026-0002', '28 Sept 2026', 'Vedanta Hospitals', 6490, 'unpaid'], ['KC-INV-2026-0001', '20 Sept 2026', 'Aadithya Industries', 74245.5, 'paid']] as const).map(([n, d, c, t, s]) => (
                        <tr key={n} className="border-t border-line hover:bg-tint/60">
                          <td className="whitespace-nowrap px-4 py-2 font-medium text-brand-deep">{n}</td><td className="whitespace-nowrap px-4 py-2">{d}</td><td className="px-4 py-2">{c}</td>
                          <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">{inr(t)}</td>
                          <td className="px-4 py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <div className="grid gap-4 md:grid-cols-2">
                <Panel label="Empty screen. Says what is missing and links to the next step.">
                  <div className="rounded-lg border border-dashed border-line p-6 text-center">
                    <p className="font-medium">No quotations yet</p>
                    <p className="mt-1 text-sm text-ink-soft">You need a product and a customer first, then create one.</p>
                    <p className="mt-3 text-sm text-brand">Products &nbsp; Customers</p>
                  </div>
                </Panel>
                <Panel label="Checklist. Ticks itself from real data; only the next step gets the green button.">
                  <ol className="divide-y divide-line rounded-md border border-line text-sm">
                    <li className="flex items-center gap-3 px-3 py-2 text-ink-soft"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf text-white"><IconCheck /></span><span className="line-through">Add your business details</span></li>
                    <li className="flex items-center gap-3 px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">2</span><span className="flex-1 font-medium">Add your bank details</span><span className="rounded-md bg-leaf px-3 py-1.5 text-sm font-medium text-white">Do this next</span></li>
                  </ol>
                </Panel>
              </div>
            </div>
          </Section>

          <Section id="documents" title="Printed documents" lead="Quotations, invoices, delivery challans and purchase bills share one letterhead layout on A4. This is what customers actually see, so it follows stricter rules than the screens.">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <Panel className="text-sm">
                <div className="flex items-start justify-between gap-4">
                  <Image src="/logo.png" alt="" width={64} height={64} />
                  <div className="text-right"><p className="text-lg font-semibold">Kleven Care</p><p className="text-xs text-ink-soft">Alkapur Township, Hyderabad<br />GSTIN 36AVUPB6080GIZC</p></div>
                </div>
                <div className="rule-brand my-3" />
                <p className="mb-2 text-right text-xs uppercase tracking-wide text-ink-soft">Original for recipient</p>
                <div className="flex items-end justify-between"><p className="text-base font-semibold">Tax invoice</p><p className="text-xs"><span className="text-ink-soft">Invoice number</span> <span className="font-medium">KC-INV-2026-0001</span></p></div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs tabular-nums">
                    <thead className="border-b-2 border-ink text-left text-ink-soft"><tr><th className="py-1.5 pr-2 font-medium">S.No</th><th className="py-1.5 pr-2 font-medium">Description</th><th className="py-1.5 pr-2 font-medium">HSN/SAC</th><th className="py-1.5 pr-2 text-right font-medium">Qty</th><th className="py-1.5 pr-2 text-right font-medium">Unit price</th><th className="py-1.5 pr-2 text-right font-medium">IGST</th><th className="py-1.5 text-right font-medium">Total</th></tr></thead>
                    <tbody><tr className="border-b border-line"><td className="py-1.5 pr-2 text-ink-soft">1</td><td className="py-1.5 pr-2">Nebuliser Kit with T-connector</td><td className="py-1.5 pr-2">9019</td><td className="py-1.5 pr-2 text-right">30 Nos</td><td className="py-1.5 pr-2 text-right">{amount(115)}</td><td className="py-1.5 pr-2 text-right">{amount(172.5)}<span className="block text-ink-soft">5%</span></td><td className="py-1.5 text-right font-medium">{amount(3622.5)}</td></tr></tbody>
                  </table>
                </div>
                <div className="mt-3 rounded-md border-2 border-red-700 px-3 py-2 text-red-700"><p className="text-sm font-semibold uppercase tracking-wide">Cancelled</p><p className="text-xs">30 Sept 2026. Wrong quantity, reissued.</p></div>
              </Panel>
              <Panel>
                <ul className="space-y-3 text-sm">
                  {[
                    ['Letterhead', 'Logo left, business name, address and GSTIN right, then the brand rule.'],
                    ['Columns', 'S.No, Description, HSN/SAC, Qty, Unit price, Tax, Total. The tax column is headed with the tax charged.'],
                    ['Amounts', 'Plain numbers with Indian grouping, 74,245.50. No rupee sign on paper; screens keep it.'],
                    ['Numbers', 'Prefix plus a four-digit counter, KC-INV-2026-0001. One series per document type. A number is never reused.'],
                    ['Cancelled', 'A red stamp with the date and reason. The document keeps its number and stays in the list.'],
                    ['Hidden on paper', 'Navigation, buttons and the payments panel never print.'],
                  ].map(([t, d]) => <li key={t}><span className="font-medium">{t}.</span> <span className="text-ink-soft">{d}</span></li>)}
                </ul>
              </Panel>
            </div>
          </Section>

          <Section id="shape" title="Shape and space" lead="A 4px grid. Panels are white with a hairline border and no shadow; depth is not used to show importance, position and weight are.">
            <div className="grid gap-4 md:grid-cols-3">
              <Panel label="Corner radius">
                <ul className="space-y-3 text-sm">
                  {[['rounded', '4px', 'Chips'], ['rounded-md', '6px', 'Buttons, inputs, messages'], ['rounded-lg', '8px', 'Panels, tables'], ['rounded-full', 'full', 'Checklist dots, spinner']].map(([cls, px, use]) => (
                    <li key={cls} className="flex items-center gap-3"><span className={`h-9 w-9 shrink-0 border border-brand bg-tint ${cls}`} /><span><Code>{cls}</Code> <span className="text-ink-soft">{px}. {use}</span></span></li>
                  ))}
                </ul>
              </Panel>
              <Panel label="Spacing">
                <ul className="space-y-2 text-sm">
                  {[[8, 'Between fields in a row'], [12, 'Inside a table cell, between form rows'], [16, 'Panel padding'], [24, 'Between panels, page padding'], [32, 'Printed page padding'], [44, 'Height of every input and button']].map(([px, use]) => (
                    <li key={px} className="flex items-center gap-3"><span className="w-10 shrink-0 text-xs text-ink-soft">{px}px</span><span className="h-3 shrink-0 rounded-sm bg-leaf" style={{ width: Number(px) * 2 }} /><span className="text-xs text-ink-soft">{use}</span></li>
                  ))}
                </ul>
              </Panel>
              <Panel label="Widths and breakpoints">
                <ul className="space-y-2 text-sm text-ink-soft">
                  <li><span className="font-medium text-ink">1024px</span> content width on screens</li>
                  <li><span className="font-medium text-ink">210mm</span> printed document, A4 with 14mm margins</li>
                  <li><span className="font-medium text-ink">Under 1024px</span> navigation folds into a menu button</li>
                  <li><span className="font-medium text-ink">Under 640px</span> form rows stack, tables hide secondary columns</li>
                  <li><span className="font-medium text-ink">Light only</span> no dark mode, because documents print</li>
                </ul>
              </Panel>
            </div>
          </Section>

          <Section id="motion" title="Motion" lead="Motion only confirms that something happened. Nothing moves for decoration, and everything stops for people who ask their device to reduce motion.">
            <Panel className="divide-y divide-line p-0 text-sm">
              {[
                ['Hover and press', '150ms', 'Background and color fade on buttons, links and rows'],
                ['Waiting', 'spinner', 'A button shows a spinner and its waiting word, and cannot be pressed twice'],
                ['Page change', 'pulse', 'Grey blocks stand in for the page while it loads'],
                ['Sign-in headline', '700ms once', 'Rises into place on first load. The only entrance animation in the app'],
              ].map(([what, time, where]) => (
                <div key={what} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_120px_1fr]"><span className="font-medium">{what}</span><Code>{time}</Code><span className="text-ink-soft">{where}</span></div>
              ))}
            </Panel>
          </Section>

          <Section id="voice" title="Voice" lead="Write the way a careful colleague would explain it across the counter: specific, calm, and in words a shop owner uses.">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['Save changes', 'Submit'],
                ['That email and password do not match. Check both and try again.', 'Invalid credentials.'],
                ['This customer has documents, so it cannot be deleted. Press Hide instead.', 'Error 23503: foreign key violation.'],
                ['No invoices yet. You need a product and a customer first.', 'No data.'],
                ['Saturday, 9 May 2026. That is 144 days ago; check the month.', 'Warning: date out of range.'],
              ].flatMap(([good, bad]) => [
                <p key={good} className="flex gap-2 rounded-md border border-leaf/40 bg-leaf/10 px-3 py-2 text-sm text-leaf-deep"><IconCheck className="mt-0.5 h-4 w-4 shrink-0" /><span>{good}</span></p>,
                <p key={bad} className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><IconX className="mt-0.5 h-4 w-4 shrink-0" /><span>{bad}</span></p>,
              ])}
            </div>
            <ul className="mt-5 space-y-1 text-sm text-ink-soft">
              <li>Buttons say what they do, and the same action keeps the same name everywhere.</li>
              <li>Errors say what went wrong and what to do next. They never apologise and never show a code.</li>
              <li>Sentence case throughout. Dates as 30 Sept 2026. Money as {inr(74245.5)} on screen.</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}
