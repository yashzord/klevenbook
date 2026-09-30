import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { METHODS, type Payment } from '@/lib/types'
import { payStatus, STATUS_LABEL, STATUS_VARIANT, sumPaid } from '@/lib/payments'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteButton } from '@/components/delete-button'
import { PaymentForm } from './payment-form'
import { deletePayment } from './actions'

export function PaymentsPanel({ invoiceId, total, cancelled, payments, outgoing = false }: { invoiceId: string; total: string; cancelled: boolean; payments: Payment[]; outgoing?: boolean }) {
  const paid = sumPaid(payments)
  const due = Math.round((Number(total) - paid) * 100) / 100
  const status = payStatus(total, paid, cancelled)
  return (
    <Card className="no-print mx-auto mt-6 max-w-[210mm]">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardAction><Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge></CardAction>
      </CardHeader>
      <CardContent className="gap-5">
        <dl className="grid grid-cols-3 gap-3 tabular-nums">
          <div><dt className="text-xs text-muted-foreground">{outgoing ? 'Bill total' : 'Invoice total'}</dt><dd className="font-heading text-lg font-semibold">{inr(total)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">{outgoing ? 'Paid' : 'Received'}</dt><dd className="font-heading text-lg font-semibold">{inr(paid)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">{outgoing ? 'Still to pay' : 'Balance due'}</dt><dd className={`font-heading text-lg font-semibold ${due > 0 ? 'text-warning' : 'text-success'}`}>{inr(Math.max(due, 0))}</dd></div>
        </dl>
        {payments.length > 0 && (
          <ul className="divide-y rounded-lg border text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-1.5 pr-1.5 pl-3">
                <span className="w-24 text-muted-foreground">{formatDate(p.date)}</span>
                <span className="w-24 font-medium tabular-nums">{inr(p.amount)}</span>
                <span className="text-muted-foreground">{METHODS[p.method]}{p.reference ? `, ${p.reference}` : ''}</span>
                <span className="ml-auto"><DeleteButton action={deletePayment.bind(null, p.id)} label="payment" compact /></span>
              </li>
            ))}
          </ul>
        )}
        {cancelled ? <p className="text-sm text-muted-foreground">Cancelled documents owe nothing.</p> : due > 0 ? <PaymentForm invoiceId={invoiceId} due={due} /> : <p className="text-sm font-medium text-success">Fully paid.</p>}
      </CardContent>
    </Card>
  )
}
