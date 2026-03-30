import axios, { AxiosError } from 'axios'

const apiBaseUrl =
  (import.meta as { env: Record<string, string | undefined> }).env
    .VITE_API_BASE_URL ?? 'http://localhost:5000'

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    // Flask-JWT-Extended expects Bearer tokens by default.
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function extractApiError(error: unknown): string {
  const axiosErr = error as AxiosError<Record<string, unknown>>
  const payload = axiosErr.response?.data
  if (payload && typeof payload === 'object') {
    if (typeof payload.error === 'string') return payload.error
    if (typeof payload.message === 'string') return payload.message
    if (typeof payload.msg === 'string') return payload.msg
  }
  return axiosErr.message || 'Request failed'
}

