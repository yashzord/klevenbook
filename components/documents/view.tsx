import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inr } from '@/lib/gst'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Invoice, InvoiceItem, Settings, Vendor } from '@/lib/types'
import { PrintButton } from './print-button'
import { CancelForm } from './cancel-form'
import { ShareButtons } from './share-buttons'
import { DocumentPaper, type CopyKind } from './paper'

type Doc = Invoice & { customers: Customer | null; vendors?: Vendor | null; invoice_items: InvoiceItem[]; source: { number: string; kind: Kind } | null }

export function DocumentView({ doc, settings, shareUrl, copy = 'original' }: { doc: Doc; settings: Settings; shareUrl?: string; copy?: CopyKind }) {
  const kind = doc.kind, cfg = KINDS[kind], c = (doc.customers ?? doc.vendors)!
  const next = kind === 'quotation' ? { href: `/invoices/new?from=${doc.id}`, label: 'Make invoice from this quotation' }
    : kind === 'invoice' ? { href: `/challans/new?from=${doc.id}`, label: 'Make delivery challan' } : null

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        {shareUrl ? <Button asChild variant="ghost" className="-ml-3 text-muted-foreground"><Link href={cfg.path}><ArrowLeft /> All {cfg.plural.toLowerCase()}</Link></Button> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          {shareUrl && !doc.cancelled_at && <CancelForm id={doc.id} label={cfg.label.toLowerCase()} />}
          {shareUrl && !doc.cancelled_at && <Button asChild variant="outline"><Link href={`${cfg.path}/${doc.id}/edit`}><Pencil /> Edit</Link></Button>}
          {shareUrl && next && !doc.cancelled_at && <Button asChild variant="outline"><Link href={next.href}>{next.label}</Link></Button>}
          {shareUrl && cfg.party === 'customer' && <ShareButtons url={shareUrl} phone={c.phone} text={`Hello ${c.name}, here is ${cfg.label.toLowerCase()} ${doc.number} from ${settings.business_name}${cfg.money ? ` for ${inr(doc.total)}` : ''}: ${shareUrl}`} />}
          <PrintButton />
        </div>
      </div>
      {shareUrl && kind === 'invoice' && (
        <div className="no-print mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <span className="mr-1">Print as</span>
          {(['original', 'duplicate', 'triplicate'] as CopyKind[]).map((k) => (
            <Button key={k} asChild size="sm" variant={copy === k ? 'secondary' : 'ghost'} className="capitalize"><Link href={`?copy=${k}`} scroll={false}>{k}</Link></Button>
          ))}
        </div>
      )}
      <DocumentPaper doc={doc} party={c} items={doc.invoice_items} source={doc.source} settings={settings} copy={copy} />
    </>
  )
}
