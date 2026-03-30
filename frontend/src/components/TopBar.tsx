import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function TopBar() {
  const { user, isAdmin, logout } = useAuth()

  return (
    <div className="topbar">
      <div className="brand">
        BRF Maintenance{' '}
        <span style={{ fontWeight: 400, opacity: 0.8 }}>
          {user ? `(${user.username})` : ''}
        </span>
      </div>

      <div className="navActions">
        {user ? (
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            Role: {isAdmin ? 'admin' : 'tenant'}
          </span>
        ) : null}

        <Link className="btn btn-neutral border-2 border-base-300" to="/issues">
          Issues
        </Link>

        {user ? (
          <button className="btn btn-neutral border-2 border-error text-error" onClick={logout} type="button">
            Logout
          </button>
        ) : null}
      </div>
    </div>
  )
}

