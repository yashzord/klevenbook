// Plain GET form: the browser downloads the CSV the route handler returns.
export function ExportForm({ kind }: { kind: 'invoice' | 'purchase' }) {
  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  const cls = 'rounded-md border border-line bg-paper px-2 py-1.5 text-sm'
  return (
    <form action="/api/export/invoices" method="get" className="flex items-center gap-2 text-sm">
      <input type="hidden" name="kind" value={kind} />
      <label className="text-ink-soft">From <input type="date" name="from" defaultValue={first} required className={cls} /></label>
      <label className="text-ink-soft">to <input type="date" name="to" defaultValue={today.toISOString().slice(0, 10)} required className={cls} /></label>
      <button className="rounded-md border border-line bg-paper px-3 py-1.5 font-medium text-brand-deep hover:bg-tint">Download CSV</button>
    </form>
  )
}
