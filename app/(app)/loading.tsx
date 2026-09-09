export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      <div className="h-7 w-48 animate-pulse rounded bg-tint" />
      <div className="h-40 animate-pulse rounded-lg bg-tint" />
    </div>
  )
}
