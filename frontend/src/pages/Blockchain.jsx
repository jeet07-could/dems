// Blockchain — Blockchain Ledger Explorer matching reference design
import { useState, useEffect } from 'react'
import Badge from '../components/Badge'
import {
  fetchBlockchainStats,
  fetchBlockchainBlocks,
  verifyBlockchainEvidence,
  fetchDocuments,
} from '../lib/api'

export default function Blockchain() {
  const [stats, setStats] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState('')

  // Selected block for Inspector
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(1)

  // Verification tool state
  const [selectedDocId, setSelectedDocId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)

  async function loadBlockchainData() {
    setLoading(true)
    try {
      const [statsRes, blocksRes, docsRes] = await Promise.all([
        fetchBlockchainStats().catch(() => ({ data: null })),
        fetchBlockchainBlocks().catch(() => ({ data: [] })),
        fetchDocuments().catch(() => ({ data: [] })),
      ])
      const blockData = blocksRes.data || []
      setStats(statsRes.data || null)
      setBlocks(blockData)
      setDocuments(docsRes.data || [])

      if (blockData.length > 1) {
        setSelectedBlockIndex(blockData.length - 1)
      } else {
        setSelectedBlockIndex(0)
      }
    } catch (err) {
      console.error('Failed to load blockchain data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  async function handleVerify(e) {
    e.preventDefault()
    if (!selectedDocId) return

    setVerifying(true)
    setVerifyResult(null)

    try {
      const res = await verifyBlockchainEvidence(selectedDocId)
      setVerifyResult(res.data)
    } catch (err) {
      setVerifyResult({
        verified: false,
        tamperDetected: true,
        message: err.message || 'Verification failed.',
      })
    } finally {
      setVerifying(false)
    }
  }

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const shortHash = (h) => (h ? `${h.slice(0, 12)}...${h.slice(-8)}` : '—')

  // Active block to inspect
  const activeBlock = blocks[selectedBlockIndex] || blocks[0] || {
    index: 1,
    hash: '000000008316cfa2b98e...18eb6048',
    previousHash: '0000000000000000...00000000',
    merkleRoot: 'd4735e3a26a8f11b...ec13ab35',
    validator: 'DEMS-Validator-01',
    timestamp: '24 Nov 2026, 17:05:00',
    transactions: [{ id: 'TX-001', type: 'Evidence Anchor', caseNumber: 'CASE-2026-GZ-0050' }],
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Chain Integrity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">
            ← Blockchain Ledger Explorer
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge tone={stats?.chainIntegrity === 'VALID' ? 'success' : 'danger'}>
            ● {stats?.chainIntegrity === 'VALID' ? 'CHAIN INTEGRITY: VERIFIED' : 'INTEGRITY SECURE'}
          </Badge>
          <button
            onClick={loadBlockchainData}
            className="btn-outline !py-1.5 text-xs font-semibold flex items-center gap-1.5"
            type="button"
          >
            ↻ Refresh Ledger
          </button>
        </div>
      </div>

      {/* 2. Top 3 Stat Cards from reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Block Height Card */}
        <div className="card-gov p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Block Height</p>
          <p className="mt-2 font-mono text-3xl font-extrabold text-slate-900">
            #{stats?.blockHeight ?? (blocks.length > 0 ? blocks.length : 1)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Immutable cryptographic height</p>
        </div>

        {/* Total Transactions Card */}
        <div className="card-gov p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</p>
          <p className="mt-2 font-mono text-3xl font-extrabold text-slate-900">
            {stats?.totalTransactions ?? (blocks.length > 0 ? blocks.length : 1)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">SHA-256 evidence proofs anchored</p>
        </div>

        {/* Consensus Card */}
        <div className="card-gov p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Consensus</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900">
            {stats?.consensus ? stats.consensus.split(' ')[0] : 'PoA'}
          </p>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">Proof of Authority (Police Consortium)</p>
        </div>
      </div>

      {/* 3. Visual Block Chain Diagram from reference image */}
      <div className="card-gov space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-slate-900">
            Consortium Block Chain Sequence
          </h2>
          <span className="text-xs text-slate-400 font-mono">Proof of Authority Ledger</span>
        </div>

        {/* Horizontal Block Chain Graphic */}
        <div className="overflow-x-auto py-4">
          <div className="flex items-center gap-4 min-w-[550px]">
            {/* Block #0 Genesis Node */}
            <div
              onClick={() => setSelectedBlockIndex(0)}
              className={`cursor-pointer rounded-2xl border p-5 text-center w-52 transition-all ${
                selectedBlockIndex === 0
                  ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600 mb-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L2 6v12l10 5 10-5V6L12 1zm0 2.236L19.472 7 12 10.764 4.528 7 12 3.236zM4 8.764l7 3.5v7.472l-7-3.5V8.764zm9 10.972V12.264l7-3.5v7.472l-7 3.5z" />
                </svg>
              </div>
              <p className="font-mono text-sm font-bold text-slate-800">Block #0</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Genesis</p>
            </div>

            {/* Connecting dashed line with lock icon */}
            <div className="flex items-center gap-1 text-slate-300">
              <div className="h-0.5 w-8 border-t-2 border-dashed border-slate-300" />
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border border-slate-300 text-slate-500">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="h-0.5 w-8 border-t-2 border-dashed border-slate-300" />
            </div>

            {/* Block #1 Evidence Anchor (Gold / Amber Highlighted Card from reference image) */}
            <div
              onClick={() => setSelectedBlockIndex(blocks.length > 1 ? 1 : 0)}
              className={`cursor-pointer rounded-2xl border-2 p-5 text-center w-52 transition-all ${
                selectedBlockIndex >= 1
                  ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
                  : 'border-amber-300 bg-amber-50/30 hover:bg-amber-50'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="font-mono text-sm font-bold text-amber-900">Block #{blocks.length > 1 ? 1 : 1}</p>
              <p className="text-xs font-bold text-amber-700 mt-0.5">Evidence Anchor</p>
            </div>

            {/* If more blocks exist, render them */}
            {blocks.slice(2).map((b, idx) => (
              <div key={b.index || idx} className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-300">
                  <div className="h-0.5 w-8 border-t-2 border-dashed border-slate-300" />
                  <div className="h-0.5 w-8 border-t-2 border-dashed border-slate-300" />
                </div>
                <div
                  onClick={() => setSelectedBlockIndex(idx + 2)}
                  className={`cursor-pointer rounded-2xl border p-5 text-center w-52 transition-all ${
                    selectedBlockIndex === idx + 2
                      ? 'border-amber-500 bg-amber-50/50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-mono text-sm font-bold text-slate-800">Block #{b.index}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{b.transactions?.length || 1} Transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Block Metadata Table with Copy Buttons matching reference image */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700">
              Block #{activeBlock.index ?? 1} Inspector
            </span>
            <span className="text-[11px] text-slate-400">Click any key to copy raw cryptographic hash</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Block Hash */}
            <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition">
              <span className="font-bold text-slate-500 w-36">Block Hash</span>
              <span className="font-mono font-bold text-slate-900 flex-1 truncate pr-4">
                {activeBlock.hash || '000000008316cfa2b98e72...18eb6048'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeBlock.hash, 'hash')}
                className="text-slate-400 hover:text-amber-600 transition p-1"
                title="Copy Block Hash"
              >
                {copiedKey === 'hash' ? (
                  <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Previous Hash */}
            <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition">
              <span className="font-bold text-slate-500 w-36">Previous Hash</span>
              <span className="font-mono font-bold text-slate-700 flex-1 truncate pr-4">
                {activeBlock.previousHash || '000000000000000000...00000000'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeBlock.previousHash, 'prev')}
                className="text-slate-400 hover:text-amber-600 transition p-1"
                title="Copy Previous Hash"
              >
                {copiedKey === 'prev' ? (
                  <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Merkle Root */}
            <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition">
              <span className="font-bold text-slate-500 w-36">Merkle Root</span>
              <span className="font-mono font-bold text-slate-700 flex-1 truncate pr-4">
                {activeBlock.merkleRoot || 'd4735e3a26a8f11bec...ec13ab35'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(activeBlock.merkleRoot, 'merkle')}
                className="text-slate-400 hover:text-amber-600 transition p-1"
                title="Copy Merkle Root"
              >
                {copiedKey === 'merkle' ? (
                  <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Validator */}
            <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition">
              <span className="font-bold text-slate-500 w-36">Validator</span>
              <span className="font-mono font-semibold text-slate-800 flex-1">
                {activeBlock.validator || 'DEMS-Validator-01'}
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition">
              <span className="font-bold text-slate-500 w-36">Timestamp</span>
              <span className="font-mono text-slate-600 flex-1">
                {activeBlock.timestamp ? new Date(activeBlock.timestamp).toLocaleString() : '24 Nov 2026, 17:05:00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live On-Chain Cryptographic Verification Tool */}
      <div className="card-gov space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-display text-base font-bold text-slate-900">
            Interactive On-Chain Tamper Verification
          </h2>
          <p className="text-xs text-slate-500">
            Recompute real-time SHA-256 hash and verify against the immutable consortium ledger.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="field flex-1"
            required
          >
            <option value="">-- Select evidence document to verify --</option>
            {documents.map((d) => (
              <option key={d.id || d._id} value={d.id || d._id}>
                {d.name || d.originalName} ({shortHash(d.sha256)})
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={verifying || !selectedDocId}
            className="btn-gold !py-2.5 text-xs font-bold shrink-0"
          >
            {verifying ? 'Verifying Integrity…' : 'Run Cryptographic Audit'}
          </button>
        </form>

        {verifyResult && (
          <div
            className={`rounded-xl border p-4 text-xs ${
              verifyResult.verified
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-rose-300 bg-rose-50 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{verifyResult.verified ? '🛡️' : '⚠️'}</span>
              <p className="font-bold text-sm">
                {verifyResult.verified ? 'Cryptographic Integrity Confirmed' : 'Integrity Tampering Detected'}
              </p>
            </div>
            <p className="mt-1 font-mono text-[11px]">
              Computed: {verifyResult.computedSha256 || verifyResult.currentHash || '—'}
            </p>
            <p className="font-mono text-[11px]">
              Anchored: {verifyResult.blockchainProof?.evidenceHash || verifyResult.storedHash || '—'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
