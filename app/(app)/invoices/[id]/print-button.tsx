'use client'
export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print rounded-md bg-leaf px-4 py-2 font-medium text-white transition hover:bg-leaf-deep">
      Print or save as PDF
    </button>
  )
}
