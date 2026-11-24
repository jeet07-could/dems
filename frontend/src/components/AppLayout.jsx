// AppLayout — Institutional Government Shell
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NationalEmblem from './NationalEmblem'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-800">
      {/* 1. Indian Tricolor Ribbon Top Accent */}
      <div className="gov-stripe h-1 w-full shrink-0" aria-hidden="true" />

      {/* 2. Top Government of India Institutional Strip from reference image */}
      <div className="shrink-0 bg-navy-950 px-4 py-1.5 sm:px-6 text-white border-b border-navy-800">
        <div className="flex items-center justify-between">
          <NationalEmblem className="h-7" variant="light" showMinistry={true} />
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              National Secure Network
            </span>
            <span className="text-slate-600">|</span>
            <span>Digital India Forensic Standard</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Shell: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 flex h-full">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-rise">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
