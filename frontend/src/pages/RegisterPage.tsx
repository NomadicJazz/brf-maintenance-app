import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { RegisterRequest } from '../auth/types'
import { useToast } from '../ui/ToastContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { pushToast } = useToast()

  const [form, setForm] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    apartment: '',
    role: 'tenant',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        apartment: form.apartment?.trim() || undefined,
        role: form.role,
      })
      setSuccess('Registered successfully.')
      pushToast('Account created successfully.', 'success')
      // AuthProvider will navigate to /issues.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setIsSubmitting(false)
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
              <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
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

