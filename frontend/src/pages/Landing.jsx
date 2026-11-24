// Public Landing Page — Institutional Digital Evidence Mission Portal
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import NationalEmblem from '../components/NationalEmblem'
import courtBuildingImg from '../court_building.png'

const FEATURES = [
  {
    n: '01',
    title: 'Cryptographic Provenance',
    text: 'Every digital evidence file is protected with SHA-256 integrity proofs and AES-256-GCM encryption at rest.',
  },
  {
    n: '02',
    title: 'Blockchain Chain-of-Custody',
    text: 'Immutable consortium ledger anchors evidence timestamps and officer transfers for Section 65B legal admissibility.',
  },
  {
    n: '03',
    title: 'Digital Identity Access',
    text: 'Strict role-based clearance (Uploader, Reader, DM, Admin) bound to verifiable officer digital credentials.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col justify-between select-none">
      {/* 1. Indian Tricolor Ribbon Top Accent */}
      <div className="gov-stripe h-1.5 w-full shrink-0" aria-hidden="true" />

      {/* 2. Top Government Institutional Strip */}
      <header className="border-b border-navy-800 bg-navy-900/90 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <NationalEmblem className="h-9" variant="light" showMinistry={true} />
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl border border-navy-700 bg-navy-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-750 transition"
            >
              Officer Login
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition"
            >
              Enter Portal →
            </Link>
          </nav>
        </div>
      </header>

      {/* 3. Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            National Digital Public Infrastructure · Home Affairs
          </div>

          <div className="pt-2">
            <Logo size="xl" showTagline={true} />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Preserve. Verify. <span className="text-amber-400">Prosecute.</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A unified national digital forensic evidence management system engineered for Indian Police Stations,
            Judiciary, and District Administration with tamper-evident blockchain verification.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="rounded-xl bg-navy-900 border border-amber-500/40 px-6 py-3 text-sm font-bold text-amber-300 hover:bg-navy-800 shadow-xl transition flex items-center gap-2"
            >
              <span>Access Secure Officer Terminal</span>
              <span>→</span>
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 bg-navy-900/60 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-navy-800 transition"
            >
              Explore Demo System
            </Link>
          </div>
        </div>

        {/* Right Feature Panel */}
        <div className="lg:col-span-5 space-y-4">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="rounded-2xl border border-navy-800 bg-navy-900/80 p-5 shadow-xl transition hover:border-amber-500/40"
            >
              <span className="font-mono text-xs font-extrabold text-amber-400">{f.n}</span>
              <h3 className="mt-1 font-display text-base font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{f.text}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-navy-800/60 overflow-hidden shadow-2xl">
            <img
              src={courtBuildingImg}
              alt="Judicial Public Infrastructure"
              className="w-full h-36 object-cover object-bottom filter contrast-125 opacity-85"
            />
          </div>
        </div>
      </main>

      {/* 4. Institutional Trust Strip & Footer */}
      <footer className="border-t border-navy-800 bg-navy-900/90 py-4 px-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 DEMS (Digital Evidence Mission) · Digital India Forensic Initiative</span>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>SHA-256</span>
            <span>•</span>
            <span>AES-256-GCM</span>
            <span>•</span>
            <span>Proof of Authority</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
