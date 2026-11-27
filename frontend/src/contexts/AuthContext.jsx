import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, logout as logoutRequest } from '../api/auth'
import { AuthContext } from './auth-context.js'

const SESSION_KEY = 'udhari-khata-session'

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [loading, setLoading] = useState(Boolean(readSession()?.accessToken))

  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStorage.removeItem(SESSION_KEY)
      setSession(null)
      setLoading(false)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    if (!session?.accessToken) {
      return
    }
    let active = true
    getCurrentUser()
      .then((result) => {
        if (active) setSession((current) => ({ ...current, user: result.user }))
      })
      .catch(() => {
        if (active) {
          sessionStorage.removeItem(SESSION_KEY)
          setSession(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [session?.accessToken])

  const value = useMemo(() => ({
    session,
    loading,
    isAuthenticated: Boolean(session?.accessToken),
    setAuthenticatedSession(result) {
      const next = {
        accessToken: result.accessToken,
        user: result.user,
        shop: result.shop,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
    },
    async signOut() {
      try {
        await logoutRequest()
      } finally {
        sessionStorage.removeItem(SESSION_KEY)
        setSession(null)
      }
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
