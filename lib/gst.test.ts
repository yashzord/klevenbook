// Run: node --test lib/gst.test.ts   (Node 24 strips types natively)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { amount, gstType, isValidGstin, lineTotals, splitTax, stateCodeFromGstin } from './gst.ts'

test('IGST on everything while ALWAYS_IGST is on', () => {
  assert.equal(gstType('36', '36'), 'igst')
  assert.equal(gstType('36', '27'), 'igst')
})

test('state rule when ALWAYS_IGST is off: same state is CGST+SGST, other state is IGST', () => {
  assert.equal(gstType('36', '36', false), 'cgst_sgst')
  assert.equal(gstType('36', '27', false), 'igst')
})

test('printed amounts have no rupee sign and Indian grouping', () => {
  assert.equal(amount('74245.5'), '74,245.50')
  assert.equal(amount(1850.5), '1,850.50')
  assert.equal(amount(0), '0.00')
})

test('GSTIN format and state code', () => {
  assert.equal(isValidGstin('36AVUPB6080GIZC'), true)
  assert.equal(isValidGstin('36AAACB2894G1ZM'), true)
  assert.equal(isValidGstin('bad'), false)
  assert.equal(stateCodeFromGstin('27AAACB2894G1ZM'), '27')
})

test('line totals round to paise', () => {
  assert.deepEqual(lineTotals(3, 33.333, 18), { amount: 100, tax: 18 })
  assert.deepEqual(lineTotals(1, 10.01, 5), { amount: 10.01, tax: 0.5 })
})

test('split never loses a paisa', () => {
  assert.deepEqual(splitTax(0.01, 'cgst_sgst'), { cgst: 0.01, sgst: 0, igst: 0 })
  assert.deepEqual(splitTax(18.05, 'cgst_sgst'), { cgst: 9.03, sgst: 9.02, igst: 0 })
  assert.deepEqual(splitTax(18.05, 'igst'), { cgst: 0, sgst: 0, igst: 18.05 })
})
