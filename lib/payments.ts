// Paid / part paid / unpaid from an invoice total and its payments. Cancelled invoices owe nothing.
export type PayStatus = 'paid' | 'part' | 'unpaid' | 'cancelled'

export function payStatus(total: number | string, paid: number, cancelled: boolean): PayStatus {
  if (cancelled) return 'cancelled'
  const due = Number(total) - paid
  if (due <= 0.005) return 'paid'
  return paid > 0 ? 'part' : 'unpaid'
}

export const STATUS_LABEL: Record<PayStatus, string> = { paid: 'Paid', part: 'Part paid', unpaid: 'Unpaid', cancelled: 'Cancelled' }
export const STATUS_CLASS: Record<PayStatus, string> = {
  paid: 'bg-leaf/15 text-leaf-deep', part: 'bg-amber-100 text-amber-800', unpaid: 'bg-tint text-brand-deep', cancelled: 'bg-red-50 text-red-700',
}

export const sumPaid = (payments: { amount: string | number }[] | null | undefined) =>
  Math.round((payments ?? []).reduce((s, p) => s + Number(p.amount), 0) * 100) / 100
