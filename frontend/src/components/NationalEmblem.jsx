// Official Government of India Identity Header with Authentic State Emblem
export default function NationalEmblem({ className = '', variant = 'light', showMinistry = true }) {
  const isLight = variant === 'light'
  const emblemSrc = isLight
    ? '/assets/state-emblem-india-white.png'
    : '/assets/state-emblem-india-dark.png'

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Authentic State Emblem of India (Sarnath Lion Capital with Satyameva Jayate) */}
      <img
        src={emblemSrc}
        alt="State Emblem of India"
        className="h-10 sm:h-11 w-auto shrink-0 object-contain drop-shadow-sm opacity-95"
      />

      {/* Official Bilingual Institutional Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <span className={`text-[12px] font-bold tracking-wider ${isLight ? 'text-white' : 'text-slate-900'}`}>
          भारत सरकार
        </span>
        <span className={`text-[11px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-200' : 'text-slate-800'}`}>
          Government of India
        </span>
        {showMinistry && (
          <span className={`mt-0.5 text-[9px] sm:text-[10px] font-medium tracking-wide ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Ministry of Home Affairs · Digital Policing & Investigation
          </span>
        )}
      </div>
    </div>
  )
}
