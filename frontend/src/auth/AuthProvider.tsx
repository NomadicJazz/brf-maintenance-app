import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthResponse, RegisterRequest, UserPayload, LoginRequest } from './types'
import { loginApi, registerApi } from '../api/authApi'
import { AuthContext } from './AuthContext'

const ACCESS_TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

function readStoredUser(): UserPayload | null {
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserPayload
  } catch {
    return null
  }
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUserState] = useState<UserPayload | null>(null)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
    if (storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken)
      setUserState(readStoredUser())
    }
  }, [])

  const setUser = useCallback((next: UserPayload | null) => {
    setUserState(next)
    if (next) window.localStorage.setItem(USER_KEY, JSON.stringify(next))
    else window.localStorage.removeItem(USER_KEY)
  }, [])

  const login = useCallback(
    async (req: LoginRequest) => {
      const res: AuthResponse = await loginApi(req)
      setToken(res.access_token)
      window.localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token)
      setUser(res.user ?? null)
      navigate('/issues', { replace: true })
    },
    [navigate, setUser],
  )

  const register = useCallback(
    async (req: RegisterRequest) => {
      const res: AuthResponse = await registerApi(req)
      setToken(res.access_token)
      window.localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token)
      setUser(res.user ?? null)
      navigate('/issues', { replace: true })
    },
    [navigate, setUser],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    navigate('/login', { replace: true })
  }, [navigate, setUser])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        isAdmin: (user?.role ?? '') === 'admin',
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

