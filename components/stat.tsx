import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// A labelled figure: what it is, the amount, one line of context, and where to see the detail.
export function Stat({ label, value, note, href, tone }: { label: string; value: string; note?: string; href?: string; tone?: string }) {
  return (
    <Card size="sm">
      <CardContent className="gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('font-heading text-2xl font-semibold tracking-tight tabular-nums', tone)}>{value}</p>
        {(note || href) && (
          <p className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{note}</span>
            {href && <Link href={href} className="no-print inline-flex items-center gap-1 font-medium text-primary hover:underline">See all <ArrowRight className="size-3" /></Link>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
