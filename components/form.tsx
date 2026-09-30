'use client'
import { useFormStatus } from 'react-dom'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// Label above, control, hint below. The <label> wraps the control, so no ids are needed.
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm leading-snug font-medium">{label}</span>
        {children}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

// Submit button that shows a spinner and a waiting word while its form's server action runs.
export function SubmitButton({ children, pendingText, className, variant, size }: { children: React.ReactNode; pendingText: string; className?: string } & Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} className={className}>
      {pending && <Spinner />}
      {pending ? pendingText : children}
    </Button>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return <Alert variant="destructive" role="alert"><CircleAlert /><AlertDescription>{message}</AlertDescription></Alert>
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null
  return <Alert variant="success" role="status"><CircleCheck /><AlertDescription>{message}</AlertDescription></Alert>
}
