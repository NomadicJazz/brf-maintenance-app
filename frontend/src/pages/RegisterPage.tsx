import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { RegisterRequest } from '../auth/types'

export default function RegisterPage() {
  const { register } = useAuth()

  const [form, setForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    apartment: '',
    role: 'tenant',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        apartment: form.apartment?.trim() || undefined,
        role: form.role,
      })
      setSuccess('Registered successfully.')
      // AuthProvider will navigate to /issues.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="appShell">
      <div className="container">
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="brand">Register</div>
            <div className="navActions">
              <Link className="btn" to="/login">
                Back to login
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Username</div>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <div className="label">Email</div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <div className="label">Apartment (optional)</div>
              <input
                value={form.apartment ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, apartment: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <button className="btn btnPrimary" type="submit">
                Create account
              </button>
            </div>

            {error ? <div className="error">{error}</div> : null}
            {success ? <div className="success">{success}</div> : null}
          </form>
        </div>
      </div>
    </div>
  )
}

