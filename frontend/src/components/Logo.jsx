// DEMS Brand Identity — Gold Shield + Digital Fingerprint Emblem
export default function Logo({ size = 'md', showTagline = false, light = false }) {
  // Dimensions
  const dim = {
    sm: { shield: 'h-8 w-8', text: 'text-base', sub: 'text-[9px]' },
    md: { shield: 'h-10 w-10', text: 'text-xl', sub: 'text-[10px]' },
    lg: { shield: 'h-16 w-16', text: 'text-3xl', sub: 'text-xs' },
    xl: { shield: 'h-24 w-24', text: 'text-4xl', sub: 'text-sm' },
  }[size] || { shield: 'h-10 w-10', text: 'text-xl', sub: 'text-[10px]' }

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Gold Shield with Digital Fingerprint SVG */}
      <div className={`relative shrink-0 ${dim.shield}`}>
        <svg viewBox="0 0 100 120" className="h-full w-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="shieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f1a36" />
              <stop offset="100%" stopColor="#080e1e" />
            </linearGradient>
          </defs>

          {/* Shield Outer Shape */}
          <path
            d="M50 4 L88 18 C88 56, 75 92, 50 114 C25 92, 12 56, 12 18 Z"
            fill="url(#shieldBg)"
            stroke="url(#shieldBorder)"
            strokeWidth="4"
          />

          {/* Inner Golden Rim */}
          <path
            d="M50 10 L82 22 C82 54, 71 86, 50 106 C29 86, 18 54, 18 22 Z"
            fill="none"
            stroke="url(#shieldGold)"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Stylized Digital Fingerprint Ridges */}
          <g stroke="url(#shieldGold)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.95" fill="none">
            {/* Center Core Loop */}
            <path d="M50 46 C48 46, 46 48, 46 52 C46 58, 54 62, 54 68 C54 74, 48 76, 48 82" />
            {/* Loop 1 */}
            <path d="M42 45 C44 38, 56 38, 58 45 C60 52, 42 56, 42 66 C42 74, 52 78, 52 86" />
            {/* Loop 2 */}
            <path d="M36 49 C39 34, 61 34, 64 49 C66 60, 38 66, 38 78 C38 86, 48 90, 50 94" />
            {/* Loop 3 */}
            <path d="M30 55 C33 30, 67 30, 70 55 C72 68, 34 76, 34 90 C34 95, 42 98, 48 100" />
            {/* Top Arcs */}
            <path d="M42 27 C46 25, 54 25, 58 27" />
            <path d="M36 32 C43 28, 57 28, 64 32" />
          </g>
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display ${dim.text} font-extrabold tracking-tight ${light ? 'text-slate-900' : 'text-white'}`}>
            DEMS
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
        </div>
        <p className={`font-semibold tracking-wider uppercase ${dim.sub} text-amber-400`}>
          Digital Evidence Mission
        </p>
        {showTagline && (
          <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-300">
            Preserve <span className="text-amber-500 font-bold">·</span> Verify <span className="text-amber-500 font-bold">·</span> Prosecute
          </p>
        )}
      </div>
    </div>
  )
}
