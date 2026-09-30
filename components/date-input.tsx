'use client'
import { useState } from 'react'
import { inputClass } from '@/components/form'

// Browsers show date inputs in the device's own format (05/09 can mean May or September),
// so the picked date is spelled out underneath, with a warning when it is far from today.
export function DateInput({ name, defaultValue, required, warnDays = 30 }: { name: string; defaultValue: string; required?: boolean; warnDays?: number }) {
  const [value, setValue] = useState(defaultValue)
  const picked = value ? new Date(value + 'T00:00:00') : null
  const valid = picked && !Number.isNaN(picked.getTime())
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = valid ? Math.round((picked.getTime() - today.getTime()) / 86400000) : 0
  const far = Math.abs(days) > warnDays
  return (
    <>
      <input name={name} type="date" required={required} value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
      {valid && (
        <span suppressHydrationWarning className={`mt-1 block text-xs ${far ? 'font-medium text-amber-800' : 'text-ink-soft'}`}>
          {new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(picked)}
          {far && `. That is ${Math.abs(days)} days ${days < 0 ? 'ago' : 'from now'}; check the month.`}
        </span>
      )}
    </>
  )
}
