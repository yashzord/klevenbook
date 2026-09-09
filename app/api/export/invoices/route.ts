import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'
import { sumPaid } from '@/lib/payments'

// One row per document. kind=invoice is the GSTR-1 sales sheet, kind=purchase the input-tax side. Opens in Excel.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const from = url.searchParams.get('from') ?? '', to = url.searchParams.get('to') ?? ''
  const kind = url.searchParams.get('kind') === 'purchase' ? 'purchase' : 'invoice'
  const partyTable = kind === 'purchase' ? 'vendors' : 'customers'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return new Response('Pick a from and to date.', { status: 400 })

  const supabase = await createClient()
  // proxy.ts skips /api/, so check the session here. RLS would return nothing anyway, but say so plainly.
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) return new Response('Sign in first.', { status: 401 })
  const { data, error } = await supabase
    .from('invoices')
    .select(`number, date, reference, subtotal, cgst, sgst, igst, total, cancelled_at, party:${partyTable}(name, gstin, state_code), payments(amount)`)
    .eq('kind', kind).gte('date', from).lte('date', to)
    .order('date').order('number')
    .returns<{ number: string; date: string; reference: string | null; subtotal: string; cgst: string; sgst: string; igst: string; total: string; cancelled_at: string | null; party: { name: string; gstin: string | null; state_code: string } | null; payments: { amount: string }[] | null }[]>()
  if (error) return new Response(error.message, { status: 500 })

  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const party = kind === 'purchase' ? 'Vendor' : 'Customer'
  const header = [kind === 'purchase' ? 'Our number' : 'Invoice number', 'Date', kind === 'purchase' ? 'Vendor bill number' : 'Customer PO', 'Status', party, `${party} GSTIN`, 'Place of supply', 'Taxable value', 'CGST', 'SGST', 'IGST', 'Total', kind === 'purchase' ? 'Paid' : 'Received', 'Balance']
  const rows = data.map((r) => [
    r.number, r.date, r.reference ?? '', r.cancelled_at ? 'Cancelled' : 'Issued', r.party?.name, r.party?.gstin ?? '',
    r.party ? `${r.party.state_code} ${STATES[r.party.state_code] ?? ''}` : '',
    r.subtotal, r.cgst, r.sgst, r.igst, r.total, sumPaid(r.payments), r.cancelled_at ? 0 : Math.round((Number(r.total) - sumPaid(r.payments)) * 100) / 100,
  ].map(q).join(','))
  const csv = [header.map(q).join(','), ...rows].join('\r\n')
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${kind === 'purchase' ? 'purchases' : 'invoices'}-${from}-to-${to}.csv"` },
  })
}
