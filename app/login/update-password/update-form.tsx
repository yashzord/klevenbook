'use client'
import { useActionState } from 'react'
import { Field, FormError, SubmitButton, inputClass } from '@/components/form'
import { updatePassword } from '../actions'

export function UpdateForm() {
  const [state, action] = useActionState(updatePassword, {})
  return (
    <form action={action} className="space-y-4">
      <Field label="New password"><input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={inputClass} /></Field>
      <Field label="New password again"><input name="again" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Saving" className="w-full">Save new password</SubmitButton>
    </form>
  )
}
