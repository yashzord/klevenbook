// Sales documents and purchase bills share one table and one editor. This is what differs.
export type Kind = 'invoice' | 'quotation' | 'challan' | 'purchase'
export type Party = 'customer' | 'vendor'

export const KINDS: Record<Kind, { label: string; plural: string; path: string; title: string; money: boolean; party: Party }> = {
  invoice:   { label: 'Invoice',          plural: 'Invoices',          path: '/invoices',   title: 'Tax invoice',      money: true,  party: 'customer' },
  quotation: { label: 'Quotation',        plural: 'Quotations',        path: '/quotations', title: 'Quotation',        money: true,  party: 'customer' },
  challan:   { label: 'Delivery challan', plural: 'Delivery challans', path: '/challans',   title: 'Delivery challan', money: false, party: 'customer' },
  purchase:  { label: 'Purchase bill',    plural: 'Purchase bills',    path: '/purchases',  title: 'Purchase bill',    money: true,  party: 'vendor' },
}

export function isKind(k: string): k is Kind {
  return k in KINDS
}

// Which document can be started from which: quotation → invoice, invoice → challan.
export const SOURCE_KIND: Partial<Record<Kind, Kind>> = { invoice: 'quotation', challan: 'invoice' }

// Money flows in on invoices and out on purchase bills; both track payments.
export const PAYABLE: Kind[] = ['invoice', 'purchase']
