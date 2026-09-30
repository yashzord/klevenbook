'use client'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Field, FormError, SubmitButton } from '@/components/form'
import { updatePassword } from '../actions'

export function UpdateForm() {
  const [state, action] = useActionState(updatePassword, {})
  return (
    <form action={action} className="space-y-4">
      <Field label="New password"><Input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus /></Field>
      <Field label="New password again"><Input name="again" type="password" required minLength={8} autoComplete="new-password" /></Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Saving" size="lg" className="w-full">Save new password</SubmitButton>
    </form>
  )
}
