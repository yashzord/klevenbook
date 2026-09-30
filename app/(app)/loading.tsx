import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
