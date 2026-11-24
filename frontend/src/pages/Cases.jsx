// Cases — Investigative Case Registry & Case Workspace matching reference design
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import { sha256Hex } from '../lib/hash'
import { fetchCases, createCaseApi, askCaseCopilot, generateCaseBriefingAI } from '../lib/api'

export default function Cases() {
  const { user, canUpload } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [cases, setCases] = useState([])
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [showNewCase, setShowNewCase] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  // Selected case for Case Workspace view
  const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get('id') || null)

  // Case AI Copilot & Briefing State
  const [caseAiQuery, setCaseAiQuery] = useState('')
  const [caseAiResponse, setCaseAiResponse] = useState(null)
  const [caseAiLoading, setCaseAiLoading] = useState(false)
  const [briefingData, setBriefingData] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(false)

  const [newCase, setNewCase] = useState({
    title: '',
    priority: 'Medium',
    category: 'Cyber Crime',
    suspectName: '',
    suspectEmail: '',
    aadhaarCard: null,
  })

  const [caseError, setCaseError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creatingCase, setCreatingCase] = useState(false)

  async function loadCases() {
    try {
      setLoading(true)
      setCaseError('')
      const result = await fetchCases()
      const data = result.data || []
      setCases(data)

      // If URL param or first case, pick it for workspace
      const urlId = searchParams.get('id')
      if (urlId) {
        setSelectedCaseId(urlId)
      } else if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].caseNumber || data[0].id || data[0]._id)
      }
    } catch (error) {
      console.error('Load cases error:', error)
      setCaseError(error.message || 'Failed to load cases from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  // Sync selected case with URL query param
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setSelectedCaseId(id)
    }
  }, [searchParams])

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const title = c.title || ''
      const id = c.caseNumber || c.caseId || c.id || c._id || ''
      const q = query.toLowerCase()

      const matchQ = !q || title.toLowerCase().includes(q) || id.toString().toLowerCase().includes(q)
      const matchStage = stageFilter === 'All' || c.stage === stageFilter || c.status === stageFilter
      const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter

      return matchQ && matchStage && matchPriority
    })
  }, [cases, query, stageFilter, priorityFilter])

  // Active case data
  const currentCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null
    return (
      cases.find(
        (c) =>
          (c.caseNumber && c.caseNumber === selectedCaseId) ||
          (c.id && c.id === selectedCaseId) ||
          (c._id && c._id === selectedCaseId)
      ) || cases[0] || null
    )
  }, [cases, selectedCaseId])

  async function handleCreateCase(event) {
    event.preventDefault()
    if (!newCase.title.trim()) {
      setCaseError('Case title is required.')
      return
    }

    setCreatingCase(true)
    setCaseError('')

    try {
      let aadhaarHash = null
      if (newCase.aadhaarCard) {
        aadhaarHash = await sha256Hex(newCase.aadhaarCard)
      }

      const payload = {
        title: newCase.title.trim(),
        priority: newCase.priority,
        stage: 'Active',
        status: 'Active',
        category: newCase.category || 'Cyber Crime',
        suspect: {
          name: newCase.suspectName.trim() || 'Not provided',
          email: newCase.suspectEmail.trim() || 'Not provided',
        },
        state: user?.state || 'Uttar Pradesh',
        district: user?.district || 'Ghaziabad',
        thana: user?.thana || 'Ghaziabad Kotwali PS',
        aadhaarCard: newCase.aadhaarCard
          ? {
              name: newCase.aadhaarCard.name,
              size: newCase.aadhaarCard.size,
              type: newCase.aadhaarCard.type,
              sha256: aadhaarHash,
            }
          : null,
      }

      const res = await createCaseApi(payload)
      await loadCases()

      setNewCase({
        title: '',
        priority: 'Medium',
        category: 'Cyber Crime',
        suspectName: '',
        suspectEmail: '',
        aadhaarCard: null,
      })
      setShowNewCase(false)
      if (res?.data?.caseNumber) {
        setSelectedCaseId(res.data.caseNumber)
        setSearchParams({ id: res.data.caseNumber })
      }
    } catch (err) {
      console.error('Failed to create case:', err)
      setCaseError(err.message || 'Error registering case.')
    } finally {
      setCreatingCase(false)
    }
  }

  async function handleAskCaseCopilot(customQ) {
    const q = customQ || caseAiQuery
    if (!q || !q.trim() || !currentCase) return
    setCaseAiLoading(true)
    try {
      const res = await askCaseCopilot(currentCase.id || currentCase._id, q.trim())
      setCaseAiResponse(res)
    } catch (err) {
      setCaseAiResponse({ text: 'Error querying AI Copilot: ' + err.message })
    } finally {
      setCaseAiLoading(false)
    }
  }

  async function handleGenerateBriefing() {
    if (!currentCase) return
    setBriefingLoading(true)
    try {
      const res = await generateCaseBriefingAI(currentCase.id || currentCase._id, 'police_court')
      setBriefingData(res.briefing)
    } catch (err) {
      alert('Error generating case briefing: ' + err.message)
    } finally {
      setBriefingLoading(false)
    }
  }

  // Fingerprint SVG watermark for Case Summary Card
  const FingerprintWatermark = () => (
    <svg viewBox="0 0 100 120" className="h-28 w-28 text-slate-200 pointer-events-none select-none" fill="none">
      <path d="M50 46 C48 46, 46 48, 46 52 C46 58, 54 62, 54 68 C54 74, 48 76, 48 82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 45 C44 38, 56 38, 58 45 C60 52, 42 56, 42 66 C42 74, 52 78, 52 86" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 49 C39 34, 61 34, 64 49 C66 60, 38 66, 38 78 C38 86, 48 90, 50 94" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 55 C33 30, 67 30, 70 55 C72 68, 34 76, 34 90 C34 95, 42 98, 48 100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 27 C46 25, 54 25, 58 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 32 C43 28, 57 28, 64 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  return (
    <div className="space-y-6">
      {/* 1. Case Workspace Header from reference image */}
      {currentCase && (
        <div className="card-gov space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCaseId(null)
                  setSearchParams({})
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                <span>←</span>
                <span>Case Workspace</span>
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Last Updated:{' '}
              <span className="font-semibold text-slate-700">
                {currentCase.updatedAt ? new Date(currentCase.updatedAt).toLocaleString() : '24 Nov 2026, 17:40'}
              </span>
            </div>
          </div>

          {/* Title Row with Case ID & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {currentCase.caseNumber || currentCase.id || 'CASE-2026-GZ-0050'}
                </h1>
                <Badge tone={currentCase.priority || 'High'}>
                  {currentCase.priority || 'High Priority'}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {currentCase.title || 'Digital Evidence Examination'}
              </p>
            </div>

            {canUpload && (
              <button
                onClick={() => setShowNewCase(true)}
                className="btn-gold !py-2 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                type="button"
              >
                <span>+ Register New Case</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs from reference image */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-6">
              {['Overview', 'Evidence (2)', 'Chain of Custody', 'AI Intelligence', 'Documents', 'History'].map((tab) => {
                const isCurrent = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {tab === 'AI Intelligence' && <span className="text-amber-500 text-xs">✨</span>}
                    {tab}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab 1: Overview Tab Content */}
          {activeTab === 'Overview' && (
            <div className="space-y-5 pt-2">
              {/* Structured Key-Value Grid from reference image */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Case Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Case ID</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                      {currentCase.caseNumber || currentCase.id || 'CASE-2026-GZ-0050'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Status</span>
                    <span className="mt-0.5 inline-block">
                      <Badge tone={currentCase.status || currentCase.stage || 'Active'}>
                        {currentCase.status || currentCase.stage || 'Active'}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Priority</span>
                    <span className="mt-0.5 inline-block">
                      <Badge tone={currentCase.priority || 'High'}>
                        {currentCase.priority || 'High'}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Police Station</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {currentCase.thana || 'Ghaziabad Kotwali PS'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Assigned Officer</span>
                    <span className="font-mono font-bold text-slate-700 mt-0.5 block">
                      {currentCase.assignedOfficer || user?.digitalId || 'DEMS-UP-GZ-0002'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Registered On</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {currentCase.createdAt ? new Date(currentCase.createdAt).toLocaleDateString() : '23 Nov 2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Category</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {currentCase.category || 'Cyber Crime'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">Location</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {currentCase.district || 'Ghaziabad'}, {currentCase.state || 'UP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Case Summary Card with Fingerprint Watermark from reference image */}
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Case Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {currentCase.description ||
                      'Investigation related to digital evidence analysis and verification of cyber transaction records. Forensic examination authorized under standard operational digital evidence rules.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-slate-600">
                      Suspect: {currentCase.suspect?.name || 'Under Investigation'}
                    </span>
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-slate-600">
                      Jurisdiction: {currentCase.thana || 'Ghaziabad Kotwali PS'}
                    </span>
                  </div>
                </div>

                {/* Fingerprint Watermark */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
                  <FingerprintWatermark />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Evidence Tab */}
          {activeTab === 'Evidence (2)' && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Anchored Evidence Artifacts
                </h3>
                <Link to="/documents" className="text-xs font-bold text-amber-700 hover:text-amber-800">
                  + Add New Evidence →
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Artifact</th>
                      <th className="py-2.5 px-4">SHA-256 Digest</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">FIR_Report.pdf</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">a91f7c02d9b8e5c3...6c04f213</td>
                      <td className="py-3 px-4"><Badge tone="success">Verified ✓</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <Link to="/documents" className="font-bold text-amber-700 hover:text-amber-800">
                          Verify →
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">Seizure_Memo.pdf</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">e3b0c44298fc1c14...9afbf4c8</td>
                      <td className="py-3 px-4"><Badge tone="success">Verified ✓</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <Link to="/documents" className="font-bold text-amber-700 hover:text-amber-800">
                          Verify →
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Chain of Custody Tab */}
          {activeTab === 'Chain of Custody' && (
            <div className="pt-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Custody Transfer Log & Cryptographic Signatures
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Evidence Seized & Registered</p>
                    <p className="text-slate-500">By DEMS-UP-GZ-0001 (Investigating Officer, Ghaziabad Kotwali PS)</p>
                    <p className="font-mono text-[11px] text-amber-700 mt-1">Proof: SHA-256 Anchored on Block #1</p>
                  </div>
                  <span className="font-mono text-slate-400">23 Nov 2026, 14:20</span>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Forensic Laboratory Handoff</p>
                    <p className="text-slate-500">Transferred to State Forensic Science Laboratory (SFSL)</p>
                    <p className="font-mono text-[11px] text-blue-700 mt-1">Receipt Hash: d4735e3a26...ec13ab35</p>
                  </div>
                  <span className="font-mono text-slate-400">24 Nov 2026, 10:15</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: AI Intelligence Case Workspace */}
          {activeTab === 'AI Intelligence' && (
            <div className="space-y-6 pt-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      <span>✨ Case AI Copilot & Forensic Summary</span>
                      <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-amber-900">
                        {currentCase.caseNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      Grounded in case exhibits, Section 65B SOP, and cryptographic blockchain audit trail.
                    </p>
                  </div>
                  <Link
                    to={`/intelligence?caseId=${currentCase.caseNumber}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-navy-800 transition shadow-sm"
                  >
                    <span>Open Full AI Center</span>
                    <span>→</span>
                  </Link>
                </div>

                {/* Quick Action Prompt Chips */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-2">
                    Quick Forensic Prompts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Summarize chain of custody & forensic continuity',
                      'Identify key suspects, devices & financial transactions',
                      'Verify Section 65B BSA compliance requirements',
                      'Are there any unverified evidence exhibits in this case?',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCaseAiQuery(prompt)
                          handleAskCaseCopilot(prompt)
                        }}
                        className="rounded-lg bg-white/90 border border-amber-300 px-3 py-1 text-xs text-amber-950 hover:bg-amber-100 transition shadow-2xs text-left"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Copilot Ask Box */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={caseAiQuery}
                    onChange={(e) => setCaseAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskCaseCopilot()}
                    placeholder={`Ask AI Copilot anything about case ${currentCase.caseNumber}...`}
                    className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAskCaseCopilot()}
                    disabled={caseAiLoading || !caseAiQuery.trim()}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {caseAiLoading ? 'Analyzing...' : 'Ask Copilot'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateBriefing}
                    disabled={briefingLoading}
                    className="rounded-lg bg-navy-900 px-3 py-2 text-xs font-bold text-white hover:bg-navy-800 disabled:opacity-50 transition"
                  >
                    {briefingLoading ? 'Generating...' : 'Court Briefing'}
                  </button>
                </div>

                {/* AI Copilot Answer Display */}
                {caseAiResponse && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-amber-900 font-semibold border-b border-amber-100 pb-2 mb-2">
                      <span>Forensic Intelligence Evaluation</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Model: {caseAiResponse.meta?.model || 'Gemini 1.5 Flash'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {caseAiResponse.answer || caseAiResponse.text}
                    </div>
                  </div>
                )}

                {/* Case Briefing Display */}
                {briefingData && (
                  <div className="mt-4 rounded-lg border border-navy-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-navy-950 font-bold border-b border-slate-200 pb-2 mb-3">
                      <span>Official Executive Briefing Report</span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(JSON.stringify(briefingData, null, 2))
                          alert('Briefing JSON copied to clipboard.')
                        }}
                        className="text-[11px] font-semibold text-amber-700 hover:underline"
                      >
                        Copy Report
                      </button>
                    </div>
                    <div className="space-y-3 text-xs text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900 block">Executive Summary:</span>
                        <p>{briefingData.executiveSummary}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Investigative Status:</span>
                        <p>{briefingData.investigativeStatus}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Chain of Custody Assessment:</span>
                        <p>{briefingData.chainOfCustodyAssessment}</p>
                      </div>
                      {briefingData.admissibilityRisks?.length > 0 && (
                        <div>
                          <span className="font-bold text-rose-800 block">Identified Admissibility Risks:</span>
                          <ul className="list-disc list-inside text-rose-700 mt-0.5">
                            {briefingData.admissibilityRisks.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4 & 5 Fallbacks */}
          {(activeTab === 'Documents' || activeTab === 'History') && (
            <div className="pt-4 text-center py-8 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Audit trail records active for {currentCase.caseNumber}</p>
              <p className="mt-1">All events cryptographically signed and stored in immutable database store.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Cases Registry Table */}
      <div className="card-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Investigative Case Registry
            </h2>
            <p className="text-xs text-slate-500">
              {filteredCases.length} case{filteredCases.length === 1 ? '' : 's'} registered in current district jurisdiction
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID or Title…"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
            />

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Stages</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Police Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCases.map((c) => {
                const caseNum = c.caseNumber || c.id || c._id
                const isSelected = selectedCaseId === caseNum

                return (
                  <tr
                    key={caseNum}
                    className={`transition cursor-pointer ${isSelected ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50'}`}
                    onClick={() => {
                      setSelectedCaseId(caseNum)
                      setSearchParams({ id: caseNum })
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {caseNum}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <p className="font-bold">{c.title}</p>
                      {c.suspect?.name && (
                        <p className="text-[11px] text-slate-500">Suspect: {c.suspect.name}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.thana || 'Ghaziabad Kotwali PS'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge tone={c.status || c.stage || 'Active'}>
                        {c.status || c.stage || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge tone={c.priority || 'Medium'}>
                        {c.priority || 'Medium'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '24 Nov 2026'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="rounded-lg bg-navy-900 px-3 py-1 font-bold text-white hover:bg-navy-800 text-xs shadow-sm"
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                )
              })}

              {!filteredCases.length && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                    No cases found matching query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. New Case Creation Modal */}
      {showNewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 animate-rise">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-navy-900">Register New Criminal Case</h3>
                <p className="text-xs text-slate-500">Official digital evidence mission case record</p>
              </div>
              <button
                onClick={() => setShowNewCase(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {caseError && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold">
                {caseError}
              </div>
            )}

            <form onSubmit={handleCreateCase} className="mt-5 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase tracking-wider mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Fraud & Unauthorized Transaction Inquiry"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    className="field"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCase.category}
                    onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                    className="field"
                  >
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Digital Forgery">Digital Forgery</option>
                    <option value="Narcotics">Narcotics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Suspect Name</label>
                  <input
                    type="text"
                    placeholder="Suspect or Accused Name"
                    value={newCase.suspectName}
                    onChange={(e) => setNewCase({ ...newCase, suspectName: e.target.value })}
                    className="field"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Suspect Email / Contact</label>
                  <input
                    type="text"
                    placeholder="Contact or email address"
                    value={newCase.suspectEmail}
                    onChange={(e) => setNewCase({ ...newCase, suspectEmail: e.target.value })}
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Attach Supporting Document / Aadhaar</label>
                <input
                  type="file"
                  onChange={(e) => setNewCase({ ...newCase, aadhaarCard: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800 cursor-pointer"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCase(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCase}
                  className="btn-gold"
                >
                  {creatingCase ? 'Creating Case…' : 'Register Case →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
