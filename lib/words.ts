const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function below1000(n: number): string {
  const h = Math.floor(n / 100), r = n % 100
  const tail = r < 20 ? ONES[r] : `${TENS[Math.floor(r / 10)]}${r % 10 ? ' ' + ONES[r % 10] : ''}`
  return [h ? `${ONES[h]} hundred` : '', tail].filter(Boolean).join(' ')
}

// Indian grouping: crore (10^7), lakh (10^5), thousand, hundred.
export function numberToWords(n: number): string {
  if (n === 0) return 'zero'
  const parts: string[] = []
  const crore = Math.floor(n / 1e7); n %= 1e7
  const lakh = Math.floor(n / 1e5); n %= 1e5
  const thousand = Math.floor(n / 1e3); n %= 1e3
  if (crore) parts.push(`${below1000(crore)} crore`)
  if (lakh) parts.push(`${below1000(lakh)} lakh`)
  if (thousand) parts.push(`${below1000(thousand)} thousand`)
  if (n) parts.push(below1000(n))
  return parts.join(' ')
}

export function rupeesInWords(amount: number | string): string {
  const total = Math.round(Number(amount) * 100)
  const rupees = Math.floor(total / 100), paise = total % 100
  const words = `${numberToWords(rupees)} rupees${paise ? ` and ${numberToWords(paise)} paise` : ''} only`
  return words.charAt(0).toUpperCase() + words.slice(1)
}
