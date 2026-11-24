import React, { createContext, useContext, useState } from 'react'
import { clearApiCache } from '@/lib/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export type AccountType = 'admin' | 'standard'

interface AccountInfo {
  accountType: AccountType
  mustChangePassword: boolean
  userNo: string | null
}

interface LoginResult {
  ok: boolean
  status?: number
}

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  account: AccountInfo | null
  login: (userNo: string, password: string) => Promise<LoginResult>
  logout: () => void
  refreshAccount: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getDeviceId(): string {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('device_id', id)
  }
  return id
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  const clearLocal = () => {
    clearApiCache()
    setToken(null)
    setAccount(null)
    localStorage.removeItem('auth_token')
  }

  const fetchAccount = async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
      })
      if (response.status === 401 || response.status === 403) {
        clearLocal()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setAccount({ accountType: data.account_type, mustChangePassword: data.must_change_password, userNo: data.user_no })
      }
    } catch (error) {
      console.error('Account check error:', error)
    }
  }

  React.useEffect(() => {
    if (!token) return
    if (isTokenExpired(token)) {
      logout()
    } else if (!account) {
      fetchAccount(token)
    }
  }, [token])

  const login = async (userNo: string, password: string): Promise<LoginResult> => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_no: userNo.trim() || null, password, device_id: getDeviceId() }),
      })

      if (response.ok) {
        const data = await response.json()
        clearApiCache()
        setAccount({ accountType: data.account_type, mustChangePassword: data.must_change_password, userNo: data.user_no })
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        return { ok: true }
      }
      return { ok: false, status: response.status }
    } catch (error) {
      return { ok: false }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    clearLocal()
  }

  const refreshAccount = async () => {
    if (token) await fetchAccount(token)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, account, login, logout, refreshAccount, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
