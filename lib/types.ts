// PostgREST returns numeric columns as strings. Use Number() or inr() when reading them.
export type Settings = {
  business_name: string; gstin: string | null; address: string | null; state_code: string
  phone: string | null; email: string | null
}
export type Product = { id: string; name: string; hsn: string | null; unit: string; price: string; gst_rate: string }
export type Customer = { id: string; name: string; gstin: string | null; state_code: string; phone: string | null; address: string | null }
export type Invoice = {
  id: string; number: string; date: string; customer_id: string; gst_type: 'cgst_sgst' | 'igst'
  subtotal: string; cgst: string; sgst: string; igst: string; total: string; notes: string | null
}
export type InvoiceItem = {
  id: string; description: string; hsn: string | null; unit: string | null
  qty: string; rate: string; gst_rate: string; amount: string; tax: string
}

// ponytail: fixed rows on the new-invoice form, no JS. Make it dynamic when an invoice needs more than 10 lines.
export const ROW_COUNT = 10
