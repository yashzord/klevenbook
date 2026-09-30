'use client'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type Option = { value: string; label: string; hint?: string }

// Searchable picker (shadcn Popover + Command). Pass `name` to submit the value with a form.
export function Combobox({ options, value, onChange, placeholder, searchPlaceholder = 'Search', empty = 'Nothing found.', name, label, className }: {
  options: Option[]; value: string; onChange: (value: string) => void; placeholder: string
  searchPlaceholder?: string; empty?: string; name?: string; label: string; className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-label={label} className={cn('w-full min-w-0 shrink justify-between px-2.5 font-normal', !selected && 'text-muted-foreground', className)}>
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronsUpDown className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{empty}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  // cmdk filters on `value`, so search by the visible name, not the id.
                  <CommandItem key={o.value} value={`${o.label} ${o.hint ?? ''}`} onSelect={() => { onChange(o.value); setOpen(false) }}>
                    <span className="grid flex-1">
                      <span>{o.label}</span>
                      {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
                    </span>
                    <Check className={cn(o.value === value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
