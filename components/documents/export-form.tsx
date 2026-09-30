import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'

// Plain GET form: the browser downloads the CSV the route handler returns.
export function ExportForm({ kind }: { kind: 'invoice' | 'purchase' }) {
  const today = new Date()
  const first = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  return (
    <form action="/api/export/invoices" method="get" className="no-print mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <input type="hidden" name="kind" value={kind} />
      <span>Export from</span>
      <span className="w-36"><DatePicker name="from" defaultValue={first} quiet /></span>
      <span>to</span>
      <span className="w-36"><DatePicker name="to" defaultValue={today.toISOString().slice(0, 10)} quiet /></span>
      <Button type="submit" variant="outline"><Download /> Download CSV</Button>
    </form>
  )
}
