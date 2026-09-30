'use client'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Field, FormError, FormSuccess, SubmitButton } from '@/components/form'
import { requestReset } from '../actions'

export function ForgotForm() {
  const [state, action] = useActionState(requestReset, {})
  return (
    <form action={action} className="space-y-4">
      <Field label="Email"><Input name="email" type="email" required autoComplete="email" autoFocus /></Field>
      <FormError message={state.error} />
      <FormSuccess message={state.ok ? 'If that email has an account, a reset link is on its way. Check spam too.' : undefined} />
      {!state.ok && <SubmitButton pendingText="Sending" size="lg" className="w-full">Email me a reset link</SubmitButton>}
    </form>
  )
}
