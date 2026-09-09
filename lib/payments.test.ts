// Run: node --test lib/payments.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { payStatus, sumPaid } from './payments.ts'

test('status', () => {
  assert.equal(payStatus('100.00', 0, false), 'unpaid')
  assert.equal(payStatus('100.00', 40, false), 'part')
  assert.equal(payStatus('100.00', 100, false), 'paid')
  assert.equal(payStatus('100.00', 99.996, false), 'paid') // rounding slack
  assert.equal(payStatus('100.00', 0, true), 'cancelled')
})

test('sum handles strings from PostgREST', () => {
  assert.equal(sumPaid([{ amount: '10.10' }, { amount: '0.20' }]), 10.3)
  assert.equal(sumPaid(null), 0)
})
