'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FormError, SubmitButton } from '@/components/form'
import { login } from './actions'

export function LoginForm() {
  const [state, action] = useActionState(login, {})
  const [show, setShow] = useState(false)
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" autoFocus placeholder="you@klevencare.com" />
      </Field>
      <Field label="Password">
        <div className="relative">
          <Input name="password" type={show ? 'text' : 'password'} required autoComplete="current-password" className="pr-11" />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute top-1 right-1 text-muted-foreground">
            {show ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Signing in" size="lg" className="w-full">Sign in</SubmitButton>
      <p className="text-center text-sm"><Link href="/login/forgot" className="text-primary underline-offset-4 hover:underline">Forgot your password?</Link></p>
    </form>
  )
}
