// Run: node --test lib/whatsapp.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone, waLink } from './whatsapp.ts'

test('phones', () => {
  assert.equal(normalizePhone('99594 31506'), '919959431506')
  assert.equal(normalizePhone('+91 9959431506'), '919959431506')
  assert.equal(normalizePhone('+1 (212) 555 0100'), '12125550100')
  assert.equal(normalizePhone('123'), null)
  assert.equal(normalizePhone(null), null)
})

test('link', () => {
  assert.equal(waLink('9959431506', 'Hi & bye'), 'https://wa.me/919959431506?text=Hi%20%26%20bye')
  assert.equal(waLink(null, 'x'), 'https://wa.me/?text=x')
})
