import { createClient } from '@/lib/supabase/server'
import { STATES } from '@/lib/states'

// GSTR-1 style sheet: one row per invoice. Opens in Excel.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const from = url.searchParams.get('from') ?? '', to = url.searchParams.get('to') ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return new Response('Pick a from and to date.', { status: 400 })

  const supabase = await createClient()
  // proxy.ts skips /api/, so check the session here. RLS would return nothing anyway, but say so plainly.
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) return new Response('Sign in first.', { status: 401 })
  const { data, error } = await supabase
    .from('invoices')
    .select('number, date, subtotal, cgst, sgst, igst, total, customers(name, gstin, state_code)')
    .eq('kind', 'invoice').gte('date', from).lte('date', to)
    .order('date').order('number')
    .returns<{ number: string; date: string; subtotal: string; cgst: string; sgst: string; igst: string; total: string; customers: { name: string; gstin: string | null; state_code: string } | null }[]>()
  if (error) return new Response(error.message, { status: 500 })

  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['Invoice number', 'Date', 'Customer', 'Customer GSTIN', 'Place of supply', 'Taxable value', 'CGST', 'SGST', 'IGST', 'Total']
  const rows = data.map((r) => [
    r.number, r.date, r.customers?.name, r.customers?.gstin ?? '',
    r.customers ? `${r.customers.state_code} ${STATES[r.customers.state_code] ?? ''}` : '',
    r.subtotal, r.cgst, r.sgst, r.igst, r.total,
  ].map(q).join(','))
  const csv = [header.map(q).join(','), ...rows].join('\r\n')
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="invoices-${from}-to-${to}.csv"` },
  })
}
