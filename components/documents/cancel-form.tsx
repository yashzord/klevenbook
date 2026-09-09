'use client'
import { useActionState, useState } from 'react'
import { FormError, SubmitButton, inputClass } from '@/components/form'
import { cancelDocument } from './actions'

export function CancelForm({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(cancelDocument.bind(null, id), {})
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-red-50 hover:text-red-700">Cancel this {label}</button>
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm">
      <input name="reason" required autoFocus placeholder="Reason, e.g. wrong quantity" className={`${inputClass} w-64`} />
      <SubmitButton pendingText="Cancelling" className="!bg-red-700 hover:!bg-red-800">Confirm cancel</SubmitButton>
      <button type="button" onClick={() => setOpen(false)} className="px-2 text-ink-soft">Keep it</button>
      <FormError message={state.error} />
    </form>
  )
}
