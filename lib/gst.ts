// Intra-state supply (seller and buyer in the same state) is taxed as CGST + SGST, half each.
// Inter-state supply is taxed as IGST. IGST Act 2017 s.7 and s.8: https://cbic-gst.gov.in/gst-acts.html
export type GstType = 'cgst_sgst' | 'igst'

export function gstType(sellerStateCode: string, buyerStateCode: string): GstType {
  return sellerStateCode === buyerStateCode ? 'cgst_sgst' : 'igst'
}

// GSTIN format: 2-digit state code, 10-char PAN, entity digit, 'Z', check char.
// https://www.gst.gov.in/help/gstin (no checksum validation here; ponytail: add if mom hits a typo)
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export function isValidGstin(gstin: string): boolean {
  return GSTIN_RE.test(gstin)
}

export function stateCodeFromGstin(gstin: string): string {
  return gstin.slice(0, 2)
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function lineTotals(qty: number, rate: number, gstRate: number) {
  const amount = r2(qty * rate)
  const tax = r2((amount * gstRate) / 100)
  return { amount, tax }
}

// Split so cgst + sgst always equals tax exactly, even on odd paise.
export function splitTax(tax: number, type: GstType) {
  if (type === 'igst') return { cgst: 0, sgst: 0, igst: tax }
  const cgst = r2(tax / 2)
  return { cgst, sgst: r2(tax - cgst), igst: 0 }
}

export function inr(n: number | string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n))
}
