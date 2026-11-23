import { createContext, useContext, useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const AuthContext = createContext(null)

function loadToken() {
  try {
    return localStorage.getItem('ecoroute_token')
  } catch {
    return null
  }
}
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('ecoroute_user') || 'null')
  } catch {
    return null
  }
}

async function request(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = new Error(data.error || 'Request failed')
    e.data = data
    throw e
  }
  return data
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!loadToken())
  const [user, setUser] = useState(() => loadUser())
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [offline, setOffline] = useState(false)

  const persist = useCallback((token, u) => {
    try {
      localStorage.setItem('ecoroute_token', token)
      localStorage.setItem('ecoroute_user', JSON.stringify(u))
    } catch {}
    setUser(u)
    setIsLoggedIn(true)
  }, [])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem('ecoroute_token')
      localStorage.removeItem('ecoroute_user')
    } catch {}
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  // Removed simulated auth fallback; surface real backend errors to UI.

  const login = useCallback(
    async (email, password) => {
      const data = await request('/api/auth/login', { email, password })
      persist(data.token, data.user)
      return data
    },
    [persist]
  )

  const signup = useCallback(async (name, email, password) => {
    return request('/api/auth/register', { name, email, password })
  }, [])

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const data = await request('/api/auth/google', { idToken })
      persist(data.token, data.user)
      return data
    },
    [persist]
  )

  const logout = useCallback(() => clear(), [clear])
  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }, [])
  const toggleOffline = useCallback(() => setOffline((o) => !o), [])

  const value = {
    isLoggedIn,
    user,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    loginWithGoogle,
    logout,
    openAuth,
    offline,
    toggleOffline,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
