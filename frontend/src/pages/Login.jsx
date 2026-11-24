// Login — Premium Institutional Portal with Sharp Cinematic Hero Background
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NationalEmblem from '../components/NationalEmblem'
import Logo from '../components/Logo'
import heroCourthouseBg from '../hero_courthouse_sharp.jpg'

const SAMPLE_CREDS = [
  { digitalId: 'DEMS-UP-GZ-0001', label: 'Ghaziabad Kotwali PS', role: 'Uploader (SI)', tone: 'primary' },
  { digitalId: 'DEMS-UP-GZ-0002', label: 'Ghaziabad Kotwali PS', role: 'Reader (HC)', tone: 'neutral' },
  { digitalId: 'DEMS-UP-GZ-0003', label: 'Sihani Gate PS', role: 'Uploader (Insp)', tone: 'primary' },
  { digitalId: 'DEMS-UP-GZ-0007', label: 'Kavinagar PS', role: 'Reader (Constable)', tone: 'neutral' },
  { digitalId: 'DEMS-UP-GZ-0025', label: 'District Magistrate Office', role: 'District DM', tone: 'warning' },
  { digitalId: 'DEMS-ADMIN-0001', label: 'State Data Center', role: 'System Admin', tone: 'danger' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [digitalId, setDigitalId] = useState('DEMS-UP-GZ-0001')
  const [password, setPassword] = useState('dems2026')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!digitalId.trim()) {
      setError('Please enter your DEMS Digital ID.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await login(digitalId.trim(), password)
    setSubmitting(false)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.')
    }
  }

  function fillCred(cred) {
    setDigitalId(cred.digitalId)
    setPassword(cred.digitalId === 'DEMS-ADMIN-0001' ? 'admin2026' : 'dems2026')
    setError('')
    setShowDemoModal(false)
  }

  return (
    <div className="relative min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-navy-950 text-white select-none">
      {/* 1. Tricolour Ribbon Top Accent */}
      <div className="gov-stripe h-1.5 w-full shrink-0" aria-hidden="true" />

      {/* 2. Top Institutional Strip with Authentic State Emblem */}
      <header className="shrink-0 border-b border-navy-800 bg-navy-900 px-6 py-2.5 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <NationalEmblem variant="light" showMinistry={true} />
          
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-850 px-3.5 py-1 text-xs font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              National Public Infrastructure
            </span>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
            >
              Demo Access ▾
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Split View: Left (Cinematic Hero) & Right (Officer Login) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ========================================================= */}
        {/* LEFT HERO PANEL: Crisp, sharp architectural background    */}
        {/* ========================================================= */}
        <section
          className="relative flex-1 lg:w-[58%] flex flex-col justify-between p-8 sm:p-12 xl:p-16 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 13, 29, 0.88) 0%, rgba(7, 13, 29, 0.65) 45%, rgba(7, 13, 29, 0.38) 75%, rgba(7, 13, 29, 0.75) 100%), url(${heroCourthouseBg})`,
          }}
        >
          {/* Upper Section: Institutional Identification & Branding */}
          <div className="relative z-10 max-w-2xl space-y-5">
            
            {/* DEMS Brand Insignia + Wordmark */}
            <div className="pt-2">
              <Logo size="lg" showTagline={false} />
            </div>

            {/* Subtitle & Motto */}
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-7 bg-amber-500" />
              <p className="font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] text-amber-400">
                Preserve <span className="text-amber-500 font-bold">·</span> Verify <span className="text-amber-500 font-bold">·</span> Prosecute
              </p>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Digital Evidence Mission
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base xl:text-lg text-slate-100 leading-relaxed font-normal max-w-xl">
              A National Digital Evidence Management & Chain-of-Custody Platform for Police, Judiciary & District Administration.
            </p>
          </div>

          {/* Lower Section: Integrated Legal Compliance & Cryptographic Proofs */}
          <div className="relative z-10 pt-8 sm:pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-mono text-xs tracking-wide">
                Section 65B Bharatiya Sakshya Adhiniyam (BSA) Cryptographic Standard
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
              <span>SHA-256</span>
              <span>·</span>
              <span>AES-256-GCM</span>
              <span>·</span>
              <span>PoA Consortium</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT AUTHENTICATION PANEL: Clean, bright institutional card */}
        {/* ========================================================= */}
        <section className="lg:w-[42%] flex items-center justify-center p-6 sm:p-10 xl:p-14 bg-navy-950 border-t lg:border-t-0 lg:border-l border-navy-800 overflow-y-auto z-10">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-2xl text-slate-900">
            
            {/* Header Badge Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-amber-400 shadow-md ring-4 ring-slate-100">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Heading & Subtitle */}
            <div className="mt-4 text-center">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
                Secure Officer Access
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                Login with your DEMS Digital ID
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Digital ID input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  DEMS Digital ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={digitalId}
                    onChange={(e) => setDigitalId(e.target.value)}
                    placeholder="DEMS-UP-GZ-0001"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3.5 py-3 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password input with toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Authenticating Digital ID…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Links: Demo Access | Forgot Password */}
            <div className="mt-5 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="hover:text-amber-600 transition"
              >
                Demo Access
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => alert('For password resets, contact your District Nodal Officer or State Cyber Cell.')}
                className="hover:text-slate-800 transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Government Innovation Trust Badge */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2.5 text-xs text-slate-600 font-medium">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-amber-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>A Government Innovation for Digital Justice</span>
            </div>
          </div>
        </section>
      </div>

      {/* Demo Credentials Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-navy-750 bg-navy-900 p-6 text-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-navy-800 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Select Demo Digital ID</h3>
                <p className="text-xs text-slate-400">Click any authorized role to auto-populate credentials</p>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-navy-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {SAMPLE_CREDS.map((cred) => (
                <button
                  key={cred.digitalId}
                  onClick={() => fillCred(cred)}
                  className="w-full flex items-center justify-between rounded-xl border border-navy-800 bg-navy-850 p-3 text-left hover:border-amber-500/50 hover:bg-navy-800 transition"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-amber-400">{cred.digitalId}</p>
                    <p className="text-xs text-slate-300">{cred.label}</p>
                  </div>
                  <span className="rounded-full bg-navy-700 px-3 py-1 text-xs font-semibold text-slate-200">
                    {cred.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-navy-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
