'use client'
import { useActionState } from 'react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FormError, SubmitButton } from '@/components/form'
import type { ActionState } from '@/app/login/actions'

// Delete behind a confirm dialog. If the server refuses, the reason shows inside the dialog.
export function DeleteButton({ action, label, compact = false }: { action: (prev: ActionState) => Promise<ActionState>; label: string; compact?: boolean }) {
  const [state, formAction] = useActionState(action, {})
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size={compact ? 'sm' : 'default'} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">{compact ? 'Delete' : `Delete ${label}`}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {label}?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone. Anything already on a document is protected and will not be deleted.</AlertDialogDescription>
        </AlertDialogHeader>
        <FormError message={state.error} />
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={formAction}><SubmitButton pendingText="Deleting" variant="destructive" className="w-full">Yes, delete</SubmitButton></form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
