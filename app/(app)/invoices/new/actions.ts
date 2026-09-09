'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { gstType, lineTotals, splitTax } from '@/lib/gst'
import { ROW_COUNT, type Customer, type Product, type Settings } from '@/lib/types'


export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  const customer_id = String(formData.get('customer_id') ?? '')
  const date = String(formData.get('date') ?? '')
  if (!customer_id || !date) throw new Error('Customer and date are required')

  const [{ data: settings }, { data: customer }, { data: products }] = await Promise.all([
    supabase.from('settings').select('*').single<Settings>(),
    supabase.from('customers').select('*').eq('id', customer_id).single<Customer>(),
    supabase.from('products').select('*').returns<Product[]>(),
  ])
  if (!settings || !customer || !products) throw new Error('Could not load data')

  const type = gstType(settings.state_code, customer.state_code)
  const items = []
  for (let i = 0; i < ROW_COUNT; i++) {
    const product = products.find((p) => p.id === formData.get(`product_${i}`))
    const qty = Number(formData.get(`qty_${i}`))
    if (!product || !(qty > 0)) continue
    const rateInput = String(formData.get(`rate_${i}`) ?? '').trim()
    const rate = rateInput === '' ? Number(product.price) : Number(rateInput)
    if (!(rate >= 0)) throw new Error(`Bad rate on row ${i + 1}`)
    const { amount, tax } = lineTotals(qty, rate, Number(product.gst_rate))
    items.push({ product_id: product.id, description: product.name, hsn: product.hsn, unit: product.unit, qty, rate, gst_rate: Number(product.gst_rate), amount, tax })
  }
  if (items.length === 0) throw new Error('Add at least one item')

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const tax = items.reduce((s, i) => s + i.tax, 0)
  const split = splitTax(Math.round(tax * 100) / 100, type)
  const inv = { customer_id, date, gst_type: type, subtotal, ...split, total: Math.round((subtotal + tax) * 100) / 100, notes: String(formData.get('notes') ?? '') }

  const { data: id, error } = await supabase.rpc('create_invoice', { inv, items })
  if (error) throw error
  redirect(`/invoices/${id}`)
}
