import { type FormEvent, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../ui/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { pushToast } = useToast()
  const location = useLocation() as { state?: { from?: string } }

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = location.state?.from ?? '/issues'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ username, password })
      pushToast('Logged in successfully.', 'success')
      // AuthProvider already navigates to /issues; we keep this as fallback.
      if (from !== '/issues') window.location.assign(from)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
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
            <div className="brand">Login</div>
            <div className="navActions">
              <Link className="btn" to="/register">
                Register
              </Link>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Username</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div style={{ marginTop: 16 }}>
              <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

