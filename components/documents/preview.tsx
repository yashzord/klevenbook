'use client'
import { useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const A4_WIDTH = 794 // 210mm at 96dpi, the width the page is designed for

// Renders children at A4 width, then scales them down to whatever space is available.
function Scaled({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ scale: 1, height: 0 })
  useEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return
      const scale = Math.min(1, outer.current.clientWidth / A4_WIDTH)
      setBox({ scale, height: inner.current.offsetHeight * scale })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(outer.current!)
    ro.observe(inner.current!)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={outer} className="overflow-hidden" style={{ height: box.height || undefined }}>
      <div ref={inner} style={{ width: A4_WIDTH, transform: `scale(${box.scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

// Beside the form on wide pages: the page as it will print, updating as she types. Never prints.
export function PreviewInline({ label = 'Draft', children }: { label?: string; children: React.ReactNode }) {
  return (
    <section aria-label="Live preview" className="no-print">
      <p className="mb-2 flex items-center gap-2 text-sm font-medium">Live preview <Badge variant="secondary">{label}</Badge></p>
      <Scaled>{children}</Scaled>
    </section>
  )
}

// On narrow pages the same preview opens over the form.
export function PreviewDialog({ label = 'Draft', note, children, className }: { label?: string; note: string; children: React.ReactNode; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button type="button" variant="outline" className={className}><Eye /> Preview</Button></DialogTrigger>
      <DialogContent className="no-print max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Preview <Badge variant="secondary">{label}</Badge></DialogTitle>
          <DialogDescription>{note}</DialogDescription>
        </DialogHeader>
        <Scaled>{children}</Scaled>
      </DialogContent>
    </Dialog>
  )
}
