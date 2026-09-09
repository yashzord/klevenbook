'use client'
import { useActionState, useState } from 'react'
import { Field, FormError, SubmitButton, inputClass } from '@/components/form'
import { login } from './actions'

export function LoginForm() {
  const [state, action] = useActionState(login, {})
  const [show, setShow] = useState(false)
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" autoFocus placeholder="you@klevencare.com" className={inputClass} />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input name="password" type={show ? 'text' : 'password'} required autoComplete="current-password" className={`${inputClass} pr-16`} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 text-xs font-medium text-brand hover:text-brand-deep">
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Signing in" className="w-full">Sign in</SubmitButton>
    </form>
  )
}
