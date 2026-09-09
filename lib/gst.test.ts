// Run: node --test lib/gst.test.ts   (Node 24 strips types natively)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gstType, isValidGstin, lineTotals, splitTax, stateCodeFromGstin } from './gst.ts'

test('same state is CGST+SGST, other state is IGST', () => {
  assert.equal(gstType('36', '36'), 'cgst_sgst')
  assert.equal(gstType('36', '27'), 'igst')
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
