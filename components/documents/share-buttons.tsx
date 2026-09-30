'use client'
import { useState } from 'react'
import { Check, Link2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { waLink } from '@/lib/whatsapp'

export function ShareButtons({ url, phone, text }: { url: string; phone: string | null; text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked: the link is still in the WhatsApp message */ }
  }
  return (
    <>
      <Button asChild className="bg-whatsapp text-foreground hover:bg-whatsapp/85">
        <a href={waLink(phone, text)} target="_blank" rel="noopener"><MessageCircle /> Send on WhatsApp</a>
      </Button>
      <Button type="button" variant="outline" onClick={copy}>{copied ? <Check /> : <Link2 />}{copied ? 'Link copied' : 'Copy link'}</Button>
    </>
  )
}
