// PostgREST returns numeric columns as strings. Use Number() or inr() when reading them.
import type { Kind } from './documents'

export type Sequence = { kind: Kind; prefix: string; next_number: number }
export type Settings = {
  business_name: string; gstin: string | null; address: string | null; state_code: string
  phone: string | null; email: string | null; quotation_terms: string | null; challan_notes: string | null
}
export type Product = { id: string; name: string; hsn: string | null; unit: string; price: string; gst_rate: string }
export type Customer = { id: string; name: string; gstin: string | null; state_code: string; phone: string | null; address: string | null }
export type Invoice = {
  id: string; kind: Kind; number: string; date: string; customer_id: string; gst_type: 'cgst_sgst' | 'igst'
  subtotal: string; cgst: string; sgst: string; igst: string; total: string; notes: string | null
  valid_until: string | null; reference: string | null; eway_bill: string | null; packages: number | null; source_id: string | null
  cancelled_at: string | null; cancel_reason: string | null
}
export type InvoiceItem = {
  id: string; product_id: string | null; description: string; hsn: string | null; unit: string | null
  qty: string; rate: string; gst_rate: string; amount: string; tax: string; batch: string | null
}
