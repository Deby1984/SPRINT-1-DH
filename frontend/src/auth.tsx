import { createContext, useContext, useEffect, useState } from 'react'
import { AUTH_INVALIDATED_EVENT, authApi, tokenStore } from './api'
import type { User } from './types'

type AuthValue = { user: User | null; loading: boolean; setUser: (user: User | null) => void; logout: () => Promise<void> }
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clearInvalidSession = () => setUser(null)
    window.addEventListener(AUTH_INVALIDATED_EVENT, clearInvalidSession)
    return () => window.removeEventListener(AUTH_INVALIDATED_EVENT, clearInvalidSession)
  }, [])

  useEffect(() => {
    if (!tokenStore.get()) { setLoading(false); return }
    authApi.me().then(setUser).catch(() => { tokenStore.clear(); setUser(null) }).finally(() => setLoading(false))
  }, [])
  async function logout() {
    try { await authApi.logout() } finally { tokenStore.clear(); setUser(null) }
  }
  return <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider no está configurado.')
  return value
}
