'use client'
import { useActionState } from 'react'
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from '@/components/form'
import { requestReset } from '../actions'

export function ForgotForm() {
  const [state, action] = useActionState(requestReset, {})
  return (
    <form action={action} className="space-y-4">
      <Field label="Email"><input name="email" type="email" required autoComplete="email" autoFocus className={inputClass} /></Field>
      <FormError message={state.error} />
      <FormSuccess message={state.ok ? 'If that email has an account, a reset link is on its way. Check spam too.' : undefined} />
      {!state.ok && <SubmitButton pendingText="Sending" className="w-full">Email me a reset link</SubmitButton>}
    </form>
  )
}
