// Auth context — connects to the real backend via Digital Identity login.
// Stores the signed-in user in React context + localStorage so a page
// refresh doesn't drop the session.
import { createContext, useContext, useEffect, useState } from 'react'
import { loginWithDigitalId, logoutApi, fetchProfile, getToken, clearTokens } from '../lib/api'

const AuthContext = createContext(null)
const SESSION_KEY = 'dems_user'

// Role metadata
const ROLE_INFO = {
  uploader:    { name: 'Uploader',           permissions: ['view', 'upload'] },
  reader:      { name: 'Reader',             permissions: ['view'] },
  officer:     { name: 'Officer',            permissions: ['view', 'upload', 'manage_cases'] },
  investigator:{ name: 'Investigator',       permissions: ['view', 'upload', 'manage_cases', 'verify'] },
  admin:       { name: 'Admin',              permissions: ['view', 'upload', 'manage_cases', 'verify', 'admin'] },
  district_dm: { name: 'District Magistrate', permissions: ['view', 'district_view'] },
  viewer:      { name: 'Viewer',             permissions: ['view'] },
}

function enrichUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    roleInfo: ROLE_INFO[raw.role] || ROLE_INFO.viewer,
    name: raw.fullName || `${raw.firstName} ${raw.lastName}`,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? enrichUser(JSON.parse(stored)) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  // On mount, verify token is still valid
  useEffect(() => {
    const token = getToken()
    if (token && !user) {
      setLoading(true)
      fetchProfile()
        .then((res) => {
          if (res.success && res.data) {
            const enriched = enrichUser(res.data)
            setUser(enriched)
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.data))
          }
        })
        .catch(() => {
          clearTokens()
          localStorage.removeItem(SESSION_KEY)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  /** Login with Digital ID + password. Calls the real backend. */
  async function login(digitalId, password) {
    try {
      const result = await loginWithDigitalId(digitalId, password)
      if (result.success && result.data?.user) {
        const enriched = enrichUser(result.data.user)
        setUser(enriched)
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.data.user))
        return { success: true }
      }
      return { success: false, error: result.message || 'Login failed.' }
    } catch (err) {
      return { success: false, error: err.message || 'Login failed.' }
    }
  }

  /** Logout — calls backend + clears local state. */
  async function logout() {
    await logoutApi()
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  /** Check if the signed-in user has a specific permission. */
  function hasPermission(code) {
    return !!user && user.roleInfo?.permissions?.includes(code)
  }

  /** True if user can upload evidence. */
  const canUpload = !!user && ['uploader', 'officer', 'investigator', 'admin'].includes(user.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canUpload, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
