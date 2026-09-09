// wa.me links open WhatsApp with a prefilled message. https://faq.whatsapp.com/5913398998672934
export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`          // Indian mobile without country code
  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length >= 11 && digits.length <= 15) return digits // already international
  return null
}

export function waLink(phone: string | null | undefined, text: string): string {
  const n = normalizePhone(phone)
  return `https://wa.me/${n ?? ''}?text=${encodeURIComponent(text)}`
}
