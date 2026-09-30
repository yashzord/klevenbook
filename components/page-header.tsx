// Title, one line of guidance, and the page's actions on the right.
export function PageHeader({ title, hint, children }: { title: string; hint?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {hint && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children && <div className="no-print flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}
