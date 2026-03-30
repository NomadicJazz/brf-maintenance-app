import { http, extractApiError } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../auth/types'

export async function registerApi(req: RegisterRequest): Promise<AuthResponse> {
  try {
    const res = await http.post<AuthResponse>('/api/auth/register', req)
    return res.data
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

export async function loginApi(req: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await http.post<AuthResponse>('/api/auth/login', req)
    return res.data
  } catch (err) {
    throw new Error(extractApiError(err))
  }
}

