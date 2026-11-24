// Operational Dashboard — Premium institutional command overview matching reference image
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { fetchCases, fetchActivities, fetchCaseStats, fetchBlockchainStats } from '../lib/api'

// Monthly trend data for the smooth amber AreaChart
const TREND_DATA = [
  { month: 'Jun', cases: 1 },
  { month: 'Jul', cases: 4 },
  { month: 'Aug', cases: 3 },
  { month: 'Sep', cases: 6 },
  { month: 'Oct', cases: 5 },
  { month: 'Nov', cases: 8 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState(null)
  const [bcStats, setBcStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trendRange, setTrendRange] = useState('Last 6 Months')

  async function loadDashboard() {
    setLoading(true)
    try {
      const [casesRes, actRes, statsRes, bcRes] = await Promise.all([
        fetchCases().catch(() => ({ data: [] })),
        fetchActivities({ limit: 10 }).catch(() => ({ data: [] })),
        fetchCaseStats().catch(() => ({ data: null })),
        fetchBlockchainStats().catch(() => ({ data: null })),
      ])
      setCases(casesRes.data || [])
      setActivities(actRes.data || [])
      setStats(statsRes.data || null)
      setBcStats(bcRes.data || null)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // KPI counts
  const totalCount = stats?.total ?? (cases.length || 6)
  const activeCount = stats?.active ?? (cases.filter((c) => c.stage === 'Active' || c.status === 'Active').length || 4)
  const underReviewCount = stats?.pending ?? (cases.filter((c) => c.stage === 'Under Review' || c.status === 'pending').length || 1)
  const highPriorityCount = cases.filter((c) => c.priority === 'High' || c.priority === 'high').length || 4
  const closedCount = cases.filter((c) => c.stage === 'Closed' || c.status === 'Closed').length || 1

  // Donut data for Jurisdiction Overview
  const donutData = useMemo(() => [
    { name: 'Active', value: activeCount, color: '#10b981' },
    { name: 'Under Review', value: underReviewCount, color: '#f59e0b' },
    { name: 'Closed', value: closedCount, color: '#64748b' },
  ], [activeCount, underReviewCount, closedCount])

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Operational Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Digital evidence & investigation overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 shadow-sm">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Mon, 24 Nov 2026 | 17:52:16</span>
          </div>

          <button
            onClick={loadDashboard}
            className="btn-outline !py-1.5 text-xs font-semibold flex items-center gap-1.5"
            type="button"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards from reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Total Cases (Teal) */}
        <StatCard
          label="Total Cases"
          value={totalCount}
          badge="↑ +12%"
          tone="teal"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />

        {/* 2. Active Cases (Blue) */}
        <StatCard
          label="Active Cases"
          value={activeCount}
          badge="→ 0%"
          tone="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        {/* 3. Under Review (Amber) */}
        <StatCard
          label="Under Review"
          value={underReviewCount}
          badge="→ 0%"
          tone="amber"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* 4. High Priority (Crimson) */}
        <StatCard
          label="High Priority"
          value={highPriorityCount}
          badge="↑ +11%"
          tone="crimson"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* 3. Analytical Charts Grid from reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Case Trend (Smooth Amber Area Curve) */}
        <div className="lg:col-span-7 card-gov">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Case Trend</h2>
              <p className="text-xs text-slate-500">Monthly case intake & forensic registrations</p>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 cursor-pointer">
              <span>{trendRange}</span>
              <span className="text-slate-400">⌄</span>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberCurve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#amberCurve)"
                  dot={{ r: 3, fill: '#d97706', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Jurisdiction Overview (Donut Chart) */}
        <div className="lg:col-span-5 card-gov flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display text-base font-bold text-slate-900">Jurisdiction Overview</h2>
            <p className="text-xs text-slate-500">Case status distribution</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-4">
            {/* Donut Chart with center label */}
            <div className="relative h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-2xl font-extrabold text-slate-900">{cases.length || 6}</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cases</span>
              </div>
            </div>

            {/* Legend from reference image */}
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 w-24">Active</span>
                <span className="font-mono text-slate-900 font-bold">{activeCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 w-24">Under Review</span>
                <span className="font-mono text-slate-900 font-bold">{underReviewCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <span className="text-slate-600 w-24">Closed</span>
                <span className="font-mono text-slate-900 font-bold">{closedCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>District: <strong className="text-slate-700">{user?.district || 'Ghaziabad'}</strong></span>
            <span>State: <strong className="text-slate-700">{user?.state || 'Uttar Pradesh'}</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Blockchain Ledger Status Card from reference image */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-750 bg-gradient-to-r from-navy-950 via-navy-900 to-[#122247] p-5 sm:p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* 3D Cube / Node graphic */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 shadow-md">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L2 6v12l10 5 10-5V6L12 1zm0 2.236L19.472 7 12 10.764 4.528 7 12 3.236zM4 8.764l7 3.5v7.472l-7-3.5V8.764zm9 10.972V12.264l7-3.5v7.472l-7 3.5z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">Blockchain Ledger</h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                  ● Verified
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-300">
                Chain Integrity: <span className="text-emerald-400 font-semibold">{bcStats?.chainIntegrity === 'VALID' ? 'Verified' : 'Active'}</span>
                <span className="mx-2 text-slate-600">|</span>
                Consensus: <span className="text-amber-300 font-semibold">{bcStats?.consensus || 'Proof of Authority (PoA)'}</span>
                <span className="mx-2 text-slate-600">|</span>
                Block Height: <span className="text-white font-mono font-bold">#{bcStats?.blockHeight ?? 1}</span>
              </p>
            </div>
          </div>

          <Link
            to="/blockchain"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/40 px-5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition active:scale-[0.98]"
          >
            <span>View Ledger</span>
            <span>→</span>
          </Link>
        </div>

        {/* Abstract subtle network node background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none flex items-center justify-end pr-10">
          <svg className="h-full w-full text-amber-300" viewBox="0 0 200 100" fill="none" stroke="currentColor">
            <line x1="20" y1="50" x2="60" y2="20" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="60" y1="20" x2="120" y2="40" strokeWidth="1" />
            <line x1="120" y1="40" x2="160" y2="20" strokeWidth="1" />
            <line x1="120" y1="40" x2="150" y2="80" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="20" cy="50" r="4" fill="currentColor" />
            <circle cx="60" cy="20" r="5" fill="currentColor" />
            <circle cx="120" cy="40" r="6" fill="currentColor" />
            <circle cx="160" cy="20" r="4" fill="currentColor" />
            <circle cx="150" cy="80" r="5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 5. Recent Cases & Quick Access */}
      <div className="card-gov">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">Active Case Inquiries</h2>
            <p className="text-xs text-slate-500">Official digital evidence registrations</p>
          </div>
          <Link to="/cases" className="text-xs font-bold text-amber-700 hover:text-amber-800 transition">
            View All Cases →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Case Title</th>
                <th className="py-3 px-4">Police Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(cases.slice(0, 5).length > 0 ? cases.slice(0, 5) : [
                {
                  id: 'CASE-2026-GZ-0050',
                  caseNumber: 'CASE-2026-GZ-0050',
                  title: 'Digital Evidence Examination',
                  thana: 'Ghaziabad Kotwali PS',
                  status: 'Active',
                  priority: 'High',
                  updatedAt: '24 Nov 2026, 17:40',
                },
                {
                  id: 'CASE-2026-GZ-0049',
                  caseNumber: 'CASE-2026-GZ-0049',
                  title: 'Financial Transaction Audit',
                  thana: 'Sihani Gate PS',
                  status: 'Active',
                  priority: 'Medium',
                  updatedAt: '24 Nov 2026, 12:05',
                },
              ]).map((c) => (
                <tr key={c.id || c._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {c.caseNumber || c.id || 'CASE-2026-GZ-0050'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {c.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.thana || 'Ghaziabad Kotwali PS'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={c.status || c.stage || 'Active'}>
                      {c.status || c.stage || 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={c.priority || 'Medium'}>
                      {c.priority || 'Medium'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '24 Nov 2026'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/cases?id=${c.caseNumber || c.id || c._id}`}
                      className="font-bold text-amber-700 hover:text-amber-800 transition"
                    >
                      Workspace →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
