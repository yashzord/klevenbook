'use client'
import { useState } from 'react'
import { waLink } from '@/lib/whatsapp'

export function ShareButtons({ url, phone, text }: { url: string; phone: string | null; text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked: the link is still in the WhatsApp message */ }
  }
  return (
    <>
      <a href={waLink(phone, text)} target="_blank" rel="noopener" className="rounded-md bg-[#25D366] px-4 py-2 font-medium text-white transition hover:bg-[#1ebe5b]">Send on WhatsApp</a>
      <button type="button" onClick={copy} className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-soft hover:bg-tint">{copied ? 'Link copied' : 'Copy link'}</button>
    </>
  )
}
