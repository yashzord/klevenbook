'use client'
import { useActionState, useState } from 'react'
import { FormError, SubmitButton } from '@/components/form'
import type { ActionState } from '@/app/login/actions'

// Two clicks to delete, no browser dialog.
export function DeleteButton({ action, label }: { action: (prev: ActionState) => Promise<ActionState>; label: string }) {
  const [armed, setArmed] = useState(false)
  const [state, formAction] = useActionState(action, {})
  if (!armed) return <button type="button" onClick={() => setArmed(true)} className="min-h-11 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-red-50 hover:text-red-700">Delete {label}</button>
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <SubmitButton pendingText="Deleting" className="!bg-red-700 hover:!bg-red-800">Yes, delete this {label}</SubmitButton>
      <button type="button" onClick={() => setArmed(false)} className="px-2 text-sm text-ink-soft">Keep it</button>
      <FormError message={state.error} />
    </form>
  )
}
