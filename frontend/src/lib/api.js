// API client — shared fetch wrapper for all backend calls.
// Automatically attaches the JWT token and handles errors.

const API_BASE = '/api'

// ── Token management ──
export function getToken() {
  return localStorage.getItem('dems_access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('dems_refresh_token')
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('dems_access_token', accessToken)
  if (refreshToken) localStorage.setItem('dems_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('dems_access_token')
  localStorage.removeItem('dems_refresh_token')
}

// ── Fetch wrapper ──
export async function api(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

// ── Auth API ──
export async function loginWithDigitalId(digitalId, password) {
  const result = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ digitalId, password }),
  })

  if (result.success && result.data?.tokens) {
    setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken)
  }

  return result
}

export async function registerUser(userData) {
  const result = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })

  if (result.success && result.data?.tokens) {
    setTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken)
  }

  return result
}

export async function fetchProfile() {
  return api('/auth/me')
}

export async function logoutApi() {
  try {
    const refreshToken = getRefreshToken()
    await api('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // Ignore — we clear tokens locally regardless
  }
  clearTokens()
}

// ── Cases API ──
export async function fetchCases(params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/cases?${query}` : '/cases'
  return api(path)
}

export async function fetchCaseById(id) {
  return api(`/cases/${id}`)
}

export async function createCaseApi(caseData) {
  return api('/cases', {
    method: 'POST',
    body: JSON.stringify(caseData),
  })
}

export async function fetchCaseStats() {
  return api('/cases/stats/overview')
}

// ── Documents API ──
export async function fetchDocuments(params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/documents?${query}` : '/documents'
  return api(path)
}

export async function uploadDocumentApi(formData) {
  return api('/documents/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function verifyDocumentApi(id) {
  return api(`/documents/${id}/verify`, {
    method: 'POST',
  })
}

// ── Activities API ──
export async function fetchActivities(params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/activities?${query}` : '/activities'
  return api(path)
}

export async function fetchActivityStats() {
  return api('/activities/stats/overview')
}

// ── Blockchain & Cybersecurity API ──
export async function fetchBlockchainStats() {
  return api('/blockchain/stats')
}

export async function fetchBlockchainBlocks() {
  return api('/blockchain/blocks')
}

export async function verifyBlockchainEvidence(documentId) {
  return api(`/blockchain/verify/${documentId}`)
}

export async function checkChainIntegrity() {
  return api('/blockchain/chain-check')
}


// ── Google Gemini AI Intelligence API ──
export async function askCaseCopilot(arg1, arg2) {
  let prompt = arg1
  let caseNumber = arg2
  if (typeof arg1 === 'string' && (arg1.startsWith('CASE-') || arg1.length === 24)) {
    caseNumber = arg1
    prompt = arg2
  }
  return api('/ai/copilot', {
    method: 'POST',
    body: JSON.stringify({ prompt, caseNumber, question: prompt, caseId: caseNumber }),
  })
}

export async function analyzeDocumentWithAI(documentId, fileName, caseNumber) {
  return api('/ai/document-analysis', {
    method: 'POST',
    body: JSON.stringify({ documentId, fileName, caseNumber }),
  })
}

export async function fetchCaseTimelineAI(caseNumber) {
  return api('/ai/timeline', {
    method: 'POST',
    body: JSON.stringify({ caseNumber }),
  })
}

export async function fetchDiscrepanciesAI(caseNumber) {
  return api('/ai/discrepancies', {
    method: 'POST',
    body: JSON.stringify({ caseNumber }),
  })
}

export async function fetchRelationshipGraphAI(caseNumber) {
  return api('/ai/relationships', {
    method: 'POST',
    body: JSON.stringify({ caseNumber }),
  })
}

export async function generateCaseBriefingAI(caseNumber) {
  return api('/ai/briefing', {
    method: 'POST',
    body: JSON.stringify({ caseNumber }),
  })
}

export async function semanticSearchAI(query, caseNumber) {
  return api('/ai/semantic-search', {
    method: 'POST',
    body: JSON.stringify({ query, caseNumber }),
  })
}

export async function previewRedactionAI(fileName, text) {
  return api('/ai/redaction-preview', {
    method: 'POST',
    body: JSON.stringify({ fileName, text }),
  })
}

export async function fetchKnowledgeBaseAI(query = '') {
  const path = query ? `/ai/knowledge?query=${encodeURIComponent(query)}` : '/ai/knowledge'
  return api(path)
}

export async function addKnowledgeArticleAI(articleData) {
  return api('/ai/knowledge', {
    method: 'POST',
    body: JSON.stringify(articleData),
  })
}

export async function deleteKnowledgeArticleAI(id) {
  return api(`/ai/knowledge/${id}`, {
    method: 'DELETE',
  })
}

export async function runAiEvaluationAI() {
  return api('/ai/evaluation')
}

export async function fetchAiAuditLogsAI() {
  return api('/ai/audit')
}
