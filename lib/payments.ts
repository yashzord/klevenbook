// Paid / part paid / unpaid from an invoice total and its payments. Cancelled invoices owe nothing.
export type PayStatus = 'paid' | 'part' | 'unpaid' | 'cancelled'

export function payStatus(total: number | string, paid: number, cancelled: boolean): PayStatus {
  if (cancelled) return 'cancelled'
  const due = Number(total) - paid
  if (due <= 0.005) return 'paid'
  return paid > 0 ? 'part' : 'unpaid'
}

export const STATUS_LABEL: Record<PayStatus, string> = { paid: 'Paid', part: 'Part paid', unpaid: 'Unpaid', cancelled: 'Cancelled' }
// Badge variants from components/ui/badge.tsx.
export const STATUS_VARIANT = { paid: 'success', part: 'warning', unpaid: 'secondary', cancelled: 'destructive' } as const satisfies Record<PayStatus, string>

export const sumPaid = (payments: { amount: string | number }[] | null | undefined) =>
  Math.round((payments ?? []).reduce((s, p) => s + Number(p.amount), 0) * 100) / 100
