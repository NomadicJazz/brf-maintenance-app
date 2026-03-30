import { createContext, useContext } from 'react'
import type { LoginRequest, RegisterRequest, UserPayload } from './types'

export type AuthContextValue = {
  token: string | null
  user: UserPayload | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (req: LoginRequest) => Promise<void>
  register: (req: RegisterRequest) => Promise<void>
  logout: () => void
  setUser: (user: UserPayload | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

