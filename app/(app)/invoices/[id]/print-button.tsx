'use client'
export function PrintButton() {
  return <button onClick={() => window.print()} className="no-print rounded bg-slate-900 px-4 py-2 text-white">Print / Save as PDF</button>
}
