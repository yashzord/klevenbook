// Run: node --test lib/words.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { numberToWords, rupeesInWords } from './words.ts'

test('indian grouping', () => {
  assert.equal(numberToWords(5230), 'five thousand two hundred thirty')
  assert.equal(numberToWords(100000), 'one lakh')
  assert.equal(numberToWords(12345678), 'one crore twenty three lakh forty five thousand six hundred seventy eight')
  assert.equal(numberToWords(1000007), 'ten lakh seven')
})

test('rupees and paise', () => {
  assert.equal(rupeesInWords('5230.05'), 'Five thousand two hundred thirty rupees and five paise only')
  assert.equal(rupeesInWords(18), 'Eighteen rupees only')
  assert.equal(rupeesInWords(0.5), 'Zero rupees and fifty paise only')
})
