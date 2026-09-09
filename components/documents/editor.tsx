'use client'
import { useActionState, useMemo, useState } from 'react'
import { Field, FormError, SubmitButton, inputClass } from '@/components/form'
import { gstType, inr, lineTotals, splitTax } from '@/lib/gst'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Product } from '@/lib/types'
import { createDocument } from './actions'

export type Row = { key: number; product_id: string; qty: string; rate: string; batch: string; rateTouched: boolean }
export type Prefill = { customer_id: string; rows: Omit<Row, 'key' | 'rateTouched'>[]; source_id: string; source_number: string; reference: string }

const blank = (key: number): Row => ({ key, product_id: '', qty: '1', rate: '', batch: '', rateTouched: false })
const plusDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10)

export function DocumentEditor({ kind, customers, products, sellerState, prefill }: {
  kind: Kind; customers: Customer[]; products: Product[]; sellerState: string; prefill?: Prefill
}) {
  const cfg = KINDS[kind]
  const [state, action] = useActionState(createDocument, {})
  const [customerId, setCustomerId] = useState(prefill?.customer_id ?? '')
  const [rows, setRows] = useState<Row[]>(() =>
    prefill?.rows.length ? prefill.rows.map((r, i) => ({ ...r, key: i + 1, rateTouched: true })) : [blank(1), blank(2), blank(3)]
  )
  const [nextKey, setNextKey] = useState(rows.length + 1)
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const customer = customers.find((c) => c.id === customerId)
  const type = customer ? gstType(sellerState, customer.state_code) : 'cgst_sgst'

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }
  function pickProduct(key: number, product_id: string) {
    const p = byId.get(product_id)
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, product_id, rate: p && !r.rateTouched ? String(Number(p.price)) : r.rate } : r)))
  }

  const lines = rows.map((r) => {
    const p = byId.get(r.product_id)
    const qty = Number(r.qty), rate = r.rate === '' && p ? Number(p.price) : Number(r.rate)
    if (!p || !(qty > 0) || !(rate >= 0)) return null
    return { qty, ...lineTotals(qty, rate, Number(p.gst_rate)) }
  })
  const filled = lines.filter(Boolean).length
  const totalQty = lines.reduce((s, l) => s + (l?.qty ?? 0), 0)
  const subtotal = Math.round(lines.reduce((s, l) => s + (l?.amount ?? 0), 0) * 100) / 100
  const tax = Math.round(lines.reduce((s, l) => s + (l?.tax ?? 0), 0) * 100) / 100
  const split = splitTax(tax, type)
  const total = Math.round((subtotal + tax) * 100) / 100

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="source_id" value={prefill?.source_id ?? ''} />
      <input type="hidden" name="items" value={JSON.stringify(rows.map(({ product_id, qty, rate, batch }) => ({ product_id, qty, rate, batch })))} />
      <div className="space-y-5">
        {prefill?.source_number && (
          <p className="rounded-md bg-tint px-3 py-2 text-sm">Started from {prefill.source_number}. Lines are copied in; change anything before saving.</p>
        )}
        <div className="grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-2">
          <Field label={kind === 'challan' ? 'Consignee (ship to)' : 'Customer'}>
            <select name="customer_id" required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputClass}>
              <option value="">Choose a customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={`${cfg.label} date`}><input name="date" type="date" required defaultValue={plusDays(0)} className={inputClass} /></Field>
          {kind === 'quotation' && <Field label="Valid until"><input name="valid_until" type="date" required defaultValue={plusDays(30)} className={inputClass} /></Field>}
          <Field label={kind === 'quotation' ? 'Reference (optional)' : 'Customer PO number (optional)'}><input name="reference" defaultValue={prefill?.reference ?? ''} className={inputClass} /></Field>
          {kind === 'challan' && (
            <>
              <Field label="E-way bill number (optional)"><input name="eway_bill" className={inputClass} /></Field>
              <Field label="Total number of packages"><input name="packages" type="number" min="0" step="1" className={inputClass} /></Field>
            </>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-tint text-left text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                {kind === 'challan' && <th className="w-40 px-3 py-2 font-medium">Batch or serial</th>}
                <th className="w-24 px-3 py-2 font-medium">Qty</th>
                {cfg.money && <th className="w-32 px-3 py-2 font-medium">Rate (₹)</th>}
                {cfg.money && <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.key} className="border-t border-line">
                  <td className="p-2">
                    <select value={r.product_id} onChange={(e) => pickProduct(r.key, e.target.value)} className={inputClass} aria-label={`Product, row ${i + 1}`}>
                      <option value="">Choose a product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  {kind === 'challan' && <td className="p-2"><input value={r.batch} onChange={(e) => update(r.key, { batch: e.target.value })} className={inputClass} aria-label={`Batch, row ${i + 1}`} /></td>}
                  <td className="p-2"><input type="number" step="any" min="0" value={r.qty} onChange={(e) => update(r.key, { qty: e.target.value })} className={inputClass} aria-label={`Quantity, row ${i + 1}`} /></td>
                  {cfg.money && <td className="p-2"><input type="number" step="0.01" min="0" value={r.rate} onChange={(e) => update(r.key, { rate: e.target.value, rateTouched: true })} className={inputClass} aria-label={`Rate, row ${i + 1}`} /></td>}
                  {cfg.money && <td className="p-2 text-right tabular-nums">{lines[i] ? inr(lines[i]!.amount) : <span className="text-ink-soft">–</span>}</td>}
                  <td className="p-2 text-center">
                    <button type="button" onClick={() => setRows((rs) => rs.length > 1 ? rs.filter((x) => x.key !== r.key) : rs)} aria-label={`Remove row ${i + 1}`} className="rounded px-2 text-ink-soft hover:bg-red-50 hover:text-red-700">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line p-2">
            <button type="button" onClick={() => { setRows((rs) => [...rs, blank(nextKey)]); setNextKey((k) => k + 1) }} className="rounded-md px-3 py-1.5 text-sm font-medium text-brand hover:bg-tint">+ Add line</button>
          </div>
        </div>

        <Field label={`Notes on the ${cfg.label.toLowerCase()} (optional)`}><textarea name="notes" rows={2} className={inputClass} placeholder={kind === 'challan' ? 'Delivered by hand' : 'Payment due within 30 days'} /></Field>
        <FormError message={state.error} />
      </div>

      <aside className="h-fit rounded-lg border border-line bg-paper p-4 text-sm lg:sticky lg:top-6">
        <p className="mb-3 text-ink-soft">{filled} {filled === 1 ? 'line' : 'lines'}{cfg.money && customer ? ` · ${type === 'igst' ? 'IGST (other state)' : 'CGST + SGST (Telangana)'}` : ''}</p>
        {cfg.money ? (
          <dl className="space-y-1.5 tabular-nums">
            <div className="flex justify-between"><dt>Taxable value</dt><dd>{inr(subtotal)}</dd></div>
            {type === 'igst' ? (
              <div className="flex justify-between"><dt>IGST</dt><dd>{inr(split.igst)}</dd></div>
            ) : (
              <>
                <div className="flex justify-between"><dt>CGST</dt><dd>{inr(split.cgst)}</dd></div>
                <div className="flex justify-between"><dt>SGST</dt><dd>{inr(split.sgst)}</dd></div>
              </>
            )}
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(total)}</dd></div>
          </dl>
        ) : (
          <dl className="tabular-nums"><div className="flex justify-between text-base font-semibold"><dt>Total quantity</dt><dd>{totalQty}</dd></div></dl>
        )}
        <SubmitButton pendingText="Creating" className="mt-4 w-full">Create {cfg.label.toLowerCase()}</SubmitButton>
      </aside>
    </form>
  )
}
