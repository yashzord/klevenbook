// "9 Sept 2026" style, the way Indian business documents write dates.
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso + 'T00:00:00'))
}
