'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { gstType, lineTotals, splitTax } from '@/lib/gst'
import { KINDS, PAYABLE, SOURCE_KIND, isKind } from '@/lib/documents'
import type { Customer, Product, Settings } from '@/lib/types'
import type { ActionState } from '@/app/login/actions'

const MAX_ROWS = 100
const r2 = (n: number) => Math.round(n * 100) / 100

// The browser shows live totals for convenience; everything is recomputed here from prices in the database.
export async function createDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const kind = String(formData.get('kind') ?? '')
  if (!isKind(kind)) return { error: 'Unknown document type.' }
  const cfg = KINDS[kind]
  const party_id = String(formData.get('party_id') ?? '')
  const date = String(formData.get('date') ?? '')
  if (!party_id) return { error: cfg.party === 'vendor' ? 'Pick a vendor.' : 'Pick a customer.' }
  const reference = String(formData.get('reference') ?? '').trim().slice(0, 100)
  if (kind === 'purchase' && !reference) return { error: "Enter the vendor's bill number. It is what your CA matches against." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a date.' }
  const valid_until = String(formData.get('valid_until') ?? '')
  if (kind === 'quotation' && !/^\d{4}-\d{2}-\d{2}$/.test(valid_until)) return { error: 'Pick a valid-until date.' }
  const packages = formData.get('packages') === null || formData.get('packages') === '' ? null : Number(formData.get('packages'))
  if (packages !== null && !(Number.isInteger(packages) && packages >= 0)) return { error: 'Packages must be a whole number.' }

  let rows: { product_id: string; qty: number; rate: string; batch?: string }[]
  try {
    rows = JSON.parse(String(formData.get('items') ?? '[]'))
    if (!Array.isArray(rows) || rows.length > MAX_ROWS) throw new Error()
  } catch {
    return { error: 'The line items could not be read. Reload the page and try again.' }
  }

  const supabase = await createClient()
  const source_id = String(formData.get('source_id') ?? '') || null
  const [{ data: settings }, { data: customer }, { data: products }, { data: source }] = await Promise.all([
    supabase.from('settings').select('*').single<Settings>(),
    supabase.from(cfg.party === 'vendor' ? 'vendors' : 'customers').select('*').eq('id', party_id).single<Customer>(),
    supabase.from('products').select('*').returns<Product[]>(),
    source_id ? supabase.from('invoices').select('id, kind').eq('id', source_id).single<{ id: string; kind: string }>() : Promise.resolve({ data: null }),
  ])
  if (!settings || !customer || !products) return { error: 'Could not load your data. Reload and try again.' }
  if (source_id && (!source || source.kind !== SOURCE_KIND[kind])) return { error: 'The linked document could not be found.' }

  const items = []
  for (const [i, row] of rows.entries()) {
    const product = products.find((p) => p.id === row.product_id)
    const qty = Number(row.qty)
    if (!product || !(qty > 0)) continue
    if (kind === 'purchase' && String(row.rate).trim() === '') return { error: `Row ${i + 1}: enter the rate from the vendor's bill.` }
    const rate = !cfg.money ? 0 : String(row.rate).trim() === '' ? Number(product.price) : Number(row.rate)
    if (!(rate >= 0)) return { error: `Row ${i + 1}: rate must be 0 or more.` }
    const gst_rate = cfg.money ? Number(product.gst_rate) : 0
    const { amount, tax } = lineTotals(qty, rate, gst_rate)
    items.push({ product_id: product.id, description: product.name, hsn: product.hsn, unit: product.unit, qty, rate, gst_rate, amount, tax, batch: String(row.batch ?? '').trim().slice(0, 100) })
  }
  if (items.length === 0) return { error: 'Add at least one line with a product and a quantity.' }

  const type = gstType(settings.state_code, customer.state_code)
  const subtotal = r2(items.reduce((s, i) => s + i.amount, 0))
  const tax = r2(items.reduce((s, i) => s + i.tax, 0))
  const inv = {
    kind, date, gst_type: type, subtotal, ...splitTax(tax, type), total: r2(subtotal + tax),
    customer_id: cfg.party === 'customer' ? party_id : null,
    vendor_id: cfg.party === 'vendor' ? party_id : null,
    notes: String(formData.get('notes') ?? '').slice(0, 2000),
    reference,
    eway_bill: String(formData.get('eway_bill') ?? '').slice(0, 50),
    valid_until: kind === 'quotation' ? valid_until : null,
    packages: kind === 'challan' ? packages : null,
    source_id,
  }

  const { data: id, error } = await supabase.rpc('create_invoice', { inv, items })
  if (error) return { error: `Could not save: ${error.message}` }
  redirect(`${cfg.path}/${id}`)
}

export async function cancelDocument(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 200)
  if (!reason) return { error: 'Say why, in a few words. It prints on the cancelled document.' }
  const supabase = await createClient()
  const { data, error } = await supabase.from('invoices')
    .update({ cancelled_at: new Date().toISOString(), cancel_reason: reason })
    .eq('id', id).is('cancelled_at', null).select('kind').single<{ kind: string }>()
  if (error || !data) return { error: 'Could not cancel. It may already be cancelled.' }
  revalidatePath('/', 'layout')
  return { ok: Date.now() }
}

export async function addPayment(invoice_id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const amount = Number(formData.get('amount'))
  const date = String(formData.get('date') ?? '')
  const method = String(formData.get('method') ?? 'bank')
  if (!(amount > 0)) return { error: 'Amount must be more than 0.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a date.' }
  if (!['bank', 'upi', 'cash', 'cheque', 'other'].includes(method)) return { error: 'Pick how it was paid.' }
  const supabase = await createClient()
  const { data: inv } = await supabase.from('invoices').select('kind, cancelled_at').eq('id', invoice_id).single<{ kind: string; cancelled_at: string | null }>()
  if (!inv || !PAYABLE.includes(inv.kind as never)) return { error: 'Payments can only be recorded against an invoice or a purchase bill.' }
  if (inv.cancelled_at) return { error: 'This document is cancelled, so nothing is owed on it.' }
  const { error } = await supabase.from('payments').insert({ invoice_id, amount, date, method, reference: String(formData.get('reference') ?? '').trim().slice(0, 100) || null })
  if (error) return { error: `Could not save: ${error.message}` }
  revalidatePath('/', 'layout')
  return { ok: Date.now() }
}

export async function deletePayment(id: string): Promise<ActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) return { error: `Could not remove: ${error.message}` }
  revalidatePath('/', 'layout')
  return { ok: Date.now() }
}
