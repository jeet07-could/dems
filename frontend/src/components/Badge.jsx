// DEMS Institutional Badge
export default function Badge({ children, tone = 'neutral', dot = true, className = '' }) {
  const styles = {
    // Green / Verified / Success
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300 dot-emerald-500',
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-300 dot-emerald-500',
    Active: 'bg-emerald-50 text-emerald-800 border-emerald-300 dot-emerald-500',

    // Red / High Priority / Danger
    danger: 'bg-rose-50 text-rose-800 border-rose-300 dot-rose-500',
    High: 'bg-rose-50 text-rose-800 border-rose-300 dot-rose-500',
    alert: 'bg-rose-50 text-rose-800 border-rose-300 dot-rose-500',

    // Amber / Warning / Under Review
    warning: 'bg-amber-50 text-amber-800 border-amber-300 dot-amber-500',
    'Under Review': 'bg-amber-50 text-amber-800 border-amber-300 dot-amber-500',
    Medium: 'bg-amber-50 text-amber-800 border-amber-300 dot-amber-500',
    pending: 'bg-amber-50 text-amber-800 border-amber-300 dot-amber-500',

    // Blue / Info
    info: 'bg-blue-50 text-blue-800 border-blue-300 dot-blue-500',
    primary: 'bg-blue-50 text-blue-800 border-blue-300 dot-blue-500',

    // Dark Navy / Blockchain / Authority
    navy: 'bg-navy-900 text-amber-300 border-navy-700 dot-amber-400',

    // Neutral / Closed / Low
    neutral: 'bg-slate-100 text-slate-700 border-slate-300 dot-slate-400',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300 dot-slate-400',
    Low: 'bg-slate-100 text-slate-700 border-slate-300 dot-slate-400',
  }[tone] || 'bg-slate-100 text-slate-700 border-slate-300 dot-slate-400'

  const dotColor = {
    success: 'bg-emerald-600',
    verified: 'bg-emerald-600',
    Active: 'bg-emerald-600',
    danger: 'bg-rose-600',
    High: 'bg-rose-600',
    alert: 'bg-rose-600',
    warning: 'bg-amber-500',
    'Under Review': 'bg-amber-500',
    Medium: 'bg-amber-500',
    pending: 'bg-amber-500',
    info: 'bg-blue-600',
    primary: 'bg-blue-600',
    navy: 'bg-amber-400',
    neutral: 'bg-slate-500',
    Closed: 'bg-slate-500',
    Low: 'bg-slate-500',
  }[tone] || 'bg-slate-500'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all ${styles} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
