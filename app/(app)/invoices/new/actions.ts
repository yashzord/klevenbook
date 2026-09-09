'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { gstType, lineTotals, splitTax } from '@/lib/gst'
import type { Customer, Product, Settings } from '@/lib/types'
import type { ActionState } from '@/app/login/actions'

const MAX_ROWS = 100

// The browser shows live totals for convenience; everything is recomputed here from prices in the database.
export async function createInvoice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const customer_id = String(formData.get('customer_id') ?? '')
  const date = String(formData.get('date') ?? '')
  if (!customer_id) return { error: 'Pick a customer.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a date.' }

  let rows: { product_id: string; qty: number; rate: string }[]
  try {
    rows = JSON.parse(String(formData.get('items') ?? '[]'))
    if (!Array.isArray(rows) || rows.length > MAX_ROWS) throw new Error()
  } catch {
    return { error: 'The line items could not be read. Reload the page and try again.' }
  }

  const supabase = await createClient()
  const [{ data: settings }, { data: customer }, { data: products }] = await Promise.all([
    supabase.from('settings').select('*').single<Settings>(),
    supabase.from('customers').select('*').eq('id', customer_id).single<Customer>(),
    supabase.from('products').select('*').returns<Product[]>(),
  ])
  if (!settings || !customer || !products) return { error: 'Could not load your data. Reload and try again.' }

  const items = []
  for (const [i, row] of rows.entries()) {
    const product = products.find((p) => p.id === row.product_id)
    const qty = Number(row.qty)
    if (!product || !(qty > 0)) continue
    const rate = String(row.rate).trim() === '' ? Number(product.price) : Number(row.rate)
    if (!(rate >= 0)) return { error: `Row ${i + 1}: rate must be 0 or more.` }
    const { amount, tax } = lineTotals(qty, rate, Number(product.gst_rate))
    items.push({ product_id: product.id, description: product.name, hsn: product.hsn, unit: product.unit, qty, rate, gst_rate: Number(product.gst_rate), amount, tax })
  }
  if (items.length === 0) return { error: 'Add at least one line with a product and a quantity.' }

  const type = gstType(settings.state_code, customer.state_code)
  const subtotal = Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100
  const tax = Math.round(items.reduce((s, i) => s + i.tax, 0) * 100) / 100
  const inv = { customer_id, date, gst_type: type, subtotal, ...splitTax(tax, type), total: Math.round((subtotal + tax) * 100) / 100, notes: String(formData.get('notes') ?? '') }

  const { data: id, error } = await supabase.rpc('create_invoice', { inv, items })
  if (error) return { error: `Could not save the invoice: ${error.message}` }
  redirect(`/invoices/${id}`)
}
