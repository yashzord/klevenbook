// Invoices, quotations and delivery challans share one table and one editor. This is what differs.
export type Kind = 'invoice' | 'quotation' | 'challan'

export const KINDS: Record<Kind, { label: string; plural: string; path: string; title: string; money: boolean }> = {
  invoice:   { label: 'Invoice',          plural: 'Invoices',          path: '/invoices',   title: 'Tax invoice',      money: true },
  quotation: { label: 'Quotation',        plural: 'Quotations',        path: '/quotations', title: 'Quotation',        money: true },
  challan:   { label: 'Delivery challan', plural: 'Delivery challans', path: '/challans',   title: 'Delivery challan', money: false },
}

export function isKind(k: string): k is Kind {
  return k in KINDS
}

// Which document can be started from which: quotation → invoice, invoice → challan.
export const SOURCE_KIND: Partial<Record<Kind, Kind>> = { invoice: 'quotation', challan: 'invoice' }
