'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { gstType, lineTotals, splitTax } from '@/lib/gst'
import { KINDS, SOURCE_KIND, isKind } from '@/lib/documents'
import type { Customer, Product, Settings } from '@/lib/types'
import type { ActionState } from '@/app/login/actions'

const MAX_ROWS = 100
const r2 = (n: number) => Math.round(n * 100) / 100

// The browser shows live totals for convenience; everything is recomputed here from prices in the database.
export async function createDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const kind = String(formData.get('kind') ?? '')
  if (!isKind(kind)) return { error: 'Unknown document type.' }
  const cfg = KINDS[kind]
  const customer_id = String(formData.get('customer_id') ?? '')
  const date = String(formData.get('date') ?? '')
  if (!customer_id) return { error: 'Pick a customer.' }
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
    supabase.from('customers').select('*').eq('id', customer_id).single<Customer>(),
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
    kind, customer_id, date, gst_type: type, subtotal, ...splitTax(tax, type), total: r2(subtotal + tax),
    notes: String(formData.get('notes') ?? '').slice(0, 2000),
    reference: String(formData.get('reference') ?? '').slice(0, 100),
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
