// Institutional KPI Card matching the reference dashboard
export default function StatCard({ label, value, badge, badgeTone = 'success', icon, tone = 'teal' }) {
  // Theme variants for the KPI card backgrounds and icons
  const cardThemes = {
    teal: {
      card: 'bg-gradient-to-br from-[#0a4843] to-[#042421] text-white border-[#125c56]',
      iconBg: 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'text-teal-200/80',
    },
    blue: {
      card: 'bg-gradient-to-br from-[#123163] to-[#0a1a36] text-white border-[#1e488f]',
      iconBg: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30',
      badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      label: 'text-blue-200/80',
    },
    amber: {
      card: 'bg-gradient-to-br from-[#593e10] to-[#2e2008] text-white border-[#7a5616]',
      iconBg: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      label: 'text-amber-200/80',
    },
    crimson: {
      card: 'bg-gradient-to-br from-[#591419] to-[#2e090c] text-white border-[#7a1e24]',
      iconBg: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'text-rose-200/80',
    },
  }[tone] || {
    card: 'bg-navy-900 text-white border-navy-750',
    iconBg: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    label: 'text-slate-300',
  }

  // Format value to 2 digits if single digit number e.g. 6 -> 06
  const formattedValue = typeof value === 'number' ? String(value).padStart(2, '0') : value

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${cardThemes.card}`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cardThemes.iconBg}`}>
          {icon}
        </div>
        {badge && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cardThemes.badge}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className={`text-xs font-medium tracking-wide uppercase ${cardThemes.label}`}>
          {label}
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white font-mono">
          {formattedValue}
        </p>
      </div>
    </div>
  )
}
