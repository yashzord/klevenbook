'use client'
import { useActionState, useMemo, useState } from 'react'
import { Plus, TriangleAlert, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/combobox'
import { DatePicker } from '@/components/date-picker'
import { Field, FormError, SubmitButton } from '@/components/form'
import { gstType, inr, lineTotals, splitTax } from '@/lib/gst'
import { KINDS, type Kind } from '@/lib/documents'
import type { Customer, Product } from '@/lib/types'
import { createDocument, updateDocument } from './actions'

export type Row = { key: number; product_id: string; qty: string; rate: string; batch: string; rateTouched: boolean }
export type Prefill = { party_id: string; rows: Omit<Row, 'key' | 'rateTouched'>[]; source_id: string; source_number: string; reference: string }
// Present when editing: the saved values the form starts from.
export type Existing = { id: string; number: string; date: string; valid_until: string | null; eway_bill: string | null; packages: number | null; notes: string | null }

const blank = (key: number): Row => ({ key, product_id: '', qty: '1', rate: '', batch: '', rateTouched: false })
const plusDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10)

export function DocumentEditor({ kind, parties, products, sellerState, prefill, existing }: {
  kind: Kind; parties: Customer[]; products: Product[]; sellerState: string; prefill?: Prefill; existing?: Existing
}) {
  const cfg = KINDS[kind]
  const [state, action] = useActionState(existing ? updateDocument.bind(null, existing.id) : createDocument, {})
  const [partyId, setPartyId] = useState(prefill?.party_id ?? '')
  const [rows, setRows] = useState<Row[]>(() =>
    prefill?.rows.length ? prefill.rows.map((r, i) => ({ ...r, key: i + 1, rateTouched: true })) : [blank(1), blank(2), blank(3)]
  )
  const [nextKey, setNextKey] = useState(rows.length + 1)
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const partyOptions = useMemo(() => parties.map((c) => ({ value: c.id, label: c.name, hint: c.gstin ?? undefined })), [parties])
  const productOptions = useMemo(() => products.map((p) => ({ value: p.id, label: p.name, hint: kind === 'purchase' || !cfg.money ? undefined : inr(p.price) })), [products, kind, cfg.money])
  const party = parties.find((c) => c.id === partyId)
  const type = gstType(sellerState, party?.state_code ?? sellerState)
  const partyWord = kind === 'purchase' ? 'vendor' : 'customer'

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }
  function pickProduct(key: number, product_id: string) {
    const p = byId.get(product_id)
    // List price is a selling price, so purchase bills never prefill it.
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, product_id, rate: p && !r.rateTouched && kind !== 'purchase' ? String(Number(p.price)) : r.rate } : r)))
  }

  const lines = rows.map((r) => {
    const p = byId.get(r.product_id)
    const qty = Number(r.qty), rate = r.rate === '' && p && kind !== 'purchase' ? Number(p.price) : Number(r.rate)
    if (!p || !(qty > 0) || !(rate >= 0)) return null
    return { qty, ...lineTotals(qty, rate, Number(p.gst_rate)) }
  })
  const filled = lines.filter(Boolean).length
  const noHsn = kind === 'purchase' ? 0 : rows.filter((r) => { const p = byId.get(r.product_id); return p && !p.hsn }).length
  const cols = kind === 'challan'
    ? 'grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_170px_90px_40px]'
    : 'grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_90px_120px_110px_40px]'
  const totalQty = lines.reduce((s, l) => s + (l?.qty ?? 0), 0)
  const subtotal = Math.round(lines.reduce((s, l) => s + (l?.amount ?? 0), 0) * 100) / 100
  const tax = Math.round(lines.reduce((s, l) => s + (l?.tax ?? 0), 0) * 100) / 100
  const split = splitTax(tax, type)
  const total = Math.round((subtotal + tax) * 100) / 100

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="source_id" value={prefill?.source_id ?? ''} />
      <input type="hidden" name="items" value={JSON.stringify(rows.map(({ product_id, qty, rate, batch }) => ({ product_id, qty, rate, batch })))} />
      <div className="min-w-0 space-y-6">
        {!existing && prefill?.source_number && (
          <Alert variant="info"><AlertDescription>Started from {prefill.source_number}. Lines are copied in; change anything before saving.</AlertDescription></Alert>
        )}
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={kind === 'challan' ? 'Consignee (ship to)' : kind === 'purchase' ? 'Vendor' : 'Customer'}>
              <Combobox name="party_id" label={`Choose a ${partyWord}`} options={partyOptions} value={partyId} onChange={setPartyId} placeholder={`Choose a ${partyWord}`} searchPlaceholder={`Search ${partyWord}s`} empty={`No ${partyWord} by that name.`} />
            </Field>
            <Field label={`${cfg.label} date`}><DatePicker name="date" defaultValue={existing?.date ?? plusDays(0)} /></Field>
            {kind === 'quotation' && <Field label="Valid until"><DatePicker name="valid_until" defaultValue={existing?.valid_until ?? plusDays(30)} warnDays={120} /></Field>}
            <Field label={kind === 'quotation' ? 'Reference (optional)' : kind === 'purchase' ? "Vendor's bill number" : 'Customer PO number (optional)'}>
              <Input name="reference" required={kind === 'purchase'} defaultValue={prefill?.reference ?? ''} />
            </Field>
            {kind === 'challan' && (
              <>
                <Field label="E-way bill number (optional)"><Input name="eway_bill" defaultValue={existing?.eway_bill ?? ''} /></Field>
                <Field label="Total number of packages"><Input name="packages" type="number" min="0" step="1" defaultValue={existing?.packages ?? undefined} /></Field>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className={`hidden gap-2 border-b bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground sm:grid ${cols}`}>
            <span>Product</span>
            {kind === 'challan' && <span>Batch or serial</span>}
            <span>Qty</span>
            {cfg.money && <span>Rate (₹)</span>}
            {cfg.money && <span className="text-right">Amount</span>}
            <span />
          </div>
          <ul className="divide-y">
            {rows.map((r, i) => (
              <li key={r.key} className={`grid items-center gap-2 px-4 py-3 ${cols}`}>
                <div className="col-span-full min-w-0 sm:col-span-1">
                  <Combobox label={`Product, row ${i + 1}`} options={productOptions} value={r.product_id} onChange={(v) => pickProduct(r.key, v)} placeholder="Choose a product" searchPlaceholder="Search products" empty="No product by that name." />
                </div>
                {kind === 'challan' && <Input value={r.batch} onChange={(e) => update(r.key, { batch: e.target.value })} placeholder="Batch or serial" aria-label={`Batch, row ${i + 1}`} />}
                <Input type="number" step="any" min="0" value={r.qty} onChange={(e) => update(r.key, { qty: e.target.value })} placeholder="Qty" aria-label={`Quantity, row ${i + 1}`} />
                {cfg.money && <Input type="number" step="0.01" min="0" value={r.rate} onChange={(e) => update(r.key, { rate: e.target.value, rateTouched: true })} placeholder="Rate" aria-label={`Rate, row ${i + 1}`} />}
                {cfg.money && <span className={`order-last col-span-full text-right text-sm tabular-nums sm:order-none sm:col-span-1 ${lines[i] ? '' : 'hidden sm:inline'}`}>{lines[i] ? <><span className="text-muted-foreground sm:hidden">Amount </span>{inr(lines[i]!.amount)}</> : <span className="text-muted-foreground">–</span>}</span>}
                <Button type="button" variant="ghost" size="icon" onClick={() => setRows((rs) => rs.length > 1 ? rs.filter((x) => x.key !== r.key) : rs)} aria-label={`Remove row ${i + 1}`} className="justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X /></Button>
              </li>
            ))}
          </ul>
          <div className="border-t p-2">
            <Button type="button" variant="ghost" onClick={() => { setRows((rs) => [...rs, blank(nextKey)]); setNextKey((k) => k + 1) }} className="text-primary"><Plus /> Add line</Button>
          </div>
        </Card>

        <Field label={kind === 'purchase' ? 'Notes (optional)' : `Notes on the ${cfg.label.toLowerCase()} (optional)`}>
          <Textarea name="notes" rows={2} defaultValue={existing?.notes ?? ''} placeholder={kind === 'challan' ? 'Delivered by hand' : kind === 'purchase' ? 'Received in 3 cartons' : 'Payment due within 30 days'} />
        </Field>
        <FormError message={state.error} />
      </div>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardContent className="space-y-4">
          {noHsn > 0 && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertDescription>
                {noHsn} {noHsn === 1 ? 'line has' : 'lines have'} no HSN code. B2B invoices need one. <a href="/products" target="_blank" className="font-medium underline">Add it in Products</a> before saving.
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">{filled} {filled === 1 ? 'line' : 'lines'}{cfg.money && party ? ` · ${type === 'igst' ? 'IGST' : 'CGST + SGST'}` : ''}</p>
          {cfg.money ? (
            <dl className="space-y-2 text-sm tabular-nums">
              <div className="flex justify-between"><dt className="text-muted-foreground">Taxable value</dt><dd>{inr(subtotal)}</dd></div>
              {type === 'igst' ? (
                <div className="flex justify-between"><dt className="text-muted-foreground">IGST</dt><dd>{inr(split.igst)}</dd></div>
              ) : (
                <>
                  <div className="flex justify-between"><dt className="text-muted-foreground">CGST</dt><dd>{inr(split.cgst)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">SGST</dt><dd>{inr(split.sgst)}</dd></div>
                </>
              )}
              <div className="flex items-baseline justify-between border-t pt-3"><dt className="font-medium">Total</dt><dd className="font-heading text-2xl font-semibold tracking-tight">{inr(total)}</dd></div>
            </dl>
          ) : (
            <dl className="tabular-nums"><div className="flex items-baseline justify-between"><dt className="font-medium">Total quantity</dt><dd className="font-heading text-2xl font-semibold tracking-tight">{totalQty}</dd></div></dl>
          )}
          {existing
            ? <SubmitButton pendingText="Saving" size="lg" className="w-full">Save changes</SubmitButton>
            : <SubmitButton pendingText="Creating" size="lg" className="w-full">Create {cfg.label.toLowerCase()}</SubmitButton>}
        </CardContent>
      </Card>
    </form>
  )
}
