// Inline outline icons, 1.5px stroke, sized by the parent. Decorative when beside text (aria-hidden); labelled by the control otherwise.
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true }
export const IconX = ({ className = 'h-5 w-5' }: P) => <svg {...base} className={className}><path d="M6 18 18 6M6 6l12 12" /></svg>
export const IconCheck = ({ className = 'h-4 w-4' }: P) => <svg {...base} strokeWidth={2} className={className}><path d="m4.5 12.75 6 6 9-13.5" /></svg>
export const IconArrowLeft = ({ className = 'h-4 w-4' }: P) => <svg {...base} className={className}><path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
export const IconPlus = ({ className = 'h-4 w-4' }: P) => <svg {...base} className={className}><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
export const IconMenu = ({ className = 'h-6 w-6' }: P) => <svg {...base} className={className}><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
