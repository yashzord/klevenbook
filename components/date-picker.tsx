'use client'
import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string) => { const d = new Date(s + 'T00:00:00'); return Number.isNaN(d.getTime()) ? undefined : d }

// A calendar with month names, so 05/09 can never be read as the wrong month.
// Submits an ISO date (yyyy-mm-dd) through a hidden input, and warns when the date is far from today.
export function DatePicker({ name, defaultValue, warnDays = 30, quiet = false, className, onChange }: { name: string; defaultValue: string; warnDays?: number; quiet?: boolean; className?: string; onChange?: (iso: string) => void }) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const picked = fromIso(value)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = picked ? Math.round((picked.getTime() - today.getTime()) / 86400000) : 0
  const far = Math.abs(days) > warnDays
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className={cn('w-full justify-start px-2.5 font-normal', !picked && 'text-muted-foreground', className)}>
            <CalendarDays className="text-muted-foreground" />
            <span suppressHydrationWarning>{picked ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(picked) : 'Pick a date'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" captionLayout="dropdown" selected={picked} defaultMonth={picked} onSelect={(d) => { if (d) { setValue(toIso(d)); onChange?.(toIso(d)); setOpen(false) } }} />
        </PopoverContent>
      </Popover>
      {!quiet && picked && (
        <span suppressHydrationWarning className={cn('text-xs', far ? 'font-medium text-warning' : 'text-muted-foreground')}>
          {new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(picked)}
          {far && `. That is ${Math.abs(days)} days ${days < 0 ? 'ago' : 'from now'}; check the month.`}
        </span>
      )}
    </>
  )
}
