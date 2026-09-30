'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Field, FormError, SubmitButton } from '@/components/form'
import { cancelDocument } from './actions'

export function CancelForm({ id, label }: { id: string; label: string }) {
  const [state, action] = useActionState(cancelDocument.bind(null, id), {})
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">Cancel this {label}</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Cancel this {label}?</DialogTitle>
            <DialogDescription>It keeps its number and stays in the list with a Cancelled stamp. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <Field label="Reason" hint="Printed on the cancelled document."><Input name="reason" required autoFocus placeholder="Wrong quantity, reissued" /></Field>
          <FormError message={state.error} />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Keep it</Button></DialogClose>
            <SubmitButton pendingText="Cancelling" variant="destructive">Cancel {label}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
