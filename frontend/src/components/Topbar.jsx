// Topbar — Institutional status bar matching reference design
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Topbar({ onToggleSidebar, title, subtitle }) {
  const { user, logout } = useAuth()
  const [district, setDistrict] = useState('Ghaziabad District, Uttar Pradesh')
  const [currentTime, setCurrentTime] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Real-time live Indian Standard Time clock matching the reference format:
  // "Mon, 24 Nov 2026 | 17:52:16"
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      // format options
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      const dayName = days[now.getDay()]
      const day = now.getDate()
      const month = months[now.getMonth()]
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      setCurrentTime(`${dayName}, ${day} ${month} ${year} | ${hours}:${minutes}:${seconds}`)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  // User initials for avatar circle
  const initials = (() => {
    if (!user) return 'GOI'
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    if (user.name) {
      const parts = user.name.split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user.role) return user.role.slice(0, 2).toUpperCase()
    return 'KA'
  })()

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
      {/* Left: Menu toggle & Jurisdiction Selector */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            title="Toggle Menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Jurisdiction dropdown pill from reference image */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 cursor-pointer">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{user?.thana ? `${user.thana}, ${user?.district || 'Ghaziabad'}` : district}</span>
          <span className="text-slate-400">⌄</span>
        </div>
      </div>

      {/* Right Controls: Live Time Pill, Notification, User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live IST Clock pill matching reference image */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 shadow-sm">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{currentTime || 'Mon, 24 Nov 2026 | 17:52:16'}</span>
        </div>

        {/* Notifications Icon with dot */}
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        {/* User Avatar Circle from reference image ("KA") */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 font-display text-xs font-bold text-white shadow-sm ring-2 ring-amber-500/40 hover:ring-amber-500 transition"
            title={user?.name || user?.digitalId}
          >
            {initials}
          </button>

          {/* Quick Profile Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="border-b border-slate-100 pb-2.5">
                <p className="font-semibold text-sm text-slate-900">{user?.name || user?.thana || 'Authorized Officer'}</p>
                <p className="font-mono text-xs font-bold text-amber-600 mt-0.5">{user?.digitalId || 'DEMS-UP-GZ-0001'}</p>
                <p className="text-[11px] text-slate-500">{user?.roleInfo?.name || user?.role} · {user?.thana}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out from DEMS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
