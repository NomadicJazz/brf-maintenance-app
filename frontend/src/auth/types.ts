export type UserRole = 'tenant' | 'admin'

export type UserPayload = {
  id: number
  username: string
  email: string
  role: UserRole | string
  apartment?: string | null
  status?: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  apartment?: string
  role?: UserRole
}

export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  access_token: string
  user?: UserPayload
  user_id?: number
}

