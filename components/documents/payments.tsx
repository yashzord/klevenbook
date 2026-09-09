import { inr } from '@/lib/gst'
import { formatDate } from '@/lib/format'
import { METHODS, type Payment } from '@/lib/types'
import { payStatus, STATUS_CLASS, STATUS_LABEL, sumPaid } from '@/lib/payments'
import { DeleteButton } from '@/components/delete-button'
import { PaymentForm } from './payment-form'
import { deletePayment } from './actions'

export function PaymentsPanel({ invoiceId, total, cancelled, payments, outgoing = false }: { invoiceId: string; total: string; cancelled: boolean; payments: Payment[]; outgoing?: boolean }) {
  const paid = sumPaid(payments)
  const due = Math.round((Number(total) - paid) * 100) / 100
  const status = payStatus(total, paid, cancelled)
  return (
    <section className="no-print mx-auto mt-6 max-w-[210mm] rounded-lg border border-line bg-paper p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Payments</h2>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
      </div>
      <dl className="mb-4 grid grid-cols-3 gap-3 text-sm tabular-nums">
        <div><dt className="text-ink-soft">{outgoing ? 'Bill total' : 'Invoice total'}</dt><dd className="font-medium">{inr(total)}</dd></div>
        <div><dt className="text-ink-soft">{outgoing ? 'Paid' : 'Received'}</dt><dd className="font-medium">{inr(paid)}</dd></div>
        <div><dt className="text-ink-soft">{outgoing ? 'Still to pay' : 'Balance due'}</dt><dd className={`font-semibold ${due > 0 ? 'text-amber-800' : 'text-leaf-deep'}`}>{inr(Math.max(due, 0))}</dd></div>
      </dl>
      {payments.length > 0 && (
        <ul className="mb-4 divide-y divide-line rounded-md border border-line text-sm">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className="w-24 text-ink-soft">{formatDate(p.date)}</span>
              <span className="w-24 font-medium tabular-nums">{inr(p.amount)}</span>
              <span className="text-ink-soft">{METHODS[p.method]}{p.reference ? `, ${p.reference}` : ''}</span>
              <span className="ml-auto"><DeleteButton action={deletePayment.bind(null, p.id)} label="payment" /></span>
            </li>
          ))}
        </ul>
      )}
      {cancelled ? <p className="text-sm text-ink-soft">Cancelled documents owe nothing.</p> : due > 0 ? <PaymentForm invoiceId={invoiceId} due={due} /> : <p className="text-sm text-leaf-deep">Fully paid.</p>}
    </section>
  )
}
