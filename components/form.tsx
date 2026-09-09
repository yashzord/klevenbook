'use client'
import { useFormStatus } from 'react-dom'

export const inputClass =
  'min-h-11 w-full rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60'

export function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

export function SubmitButton({ children, pendingText, className = '' }: { children: React.ReactNode; pendingText: string; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 font-medium text-white transition hover:bg-leaf-deep active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
      {pending ? pendingText : children}
    </button>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null
  return <p role="status" className="rounded-md border border-leaf/40 bg-leaf/10 px-3 py-2 text-sm text-leaf-deep">{message}</p>
}
