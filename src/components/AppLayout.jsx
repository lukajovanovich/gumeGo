import { Link, NavLink } from 'react-router-dom'
import TreadBackground from './TreadBackground.jsx'
import { APP_NAME } from '../config.js'
import { useAuth } from '../AuthContext.jsx'

export function BrandLogo() {
  return (
    <span className="brand-logo" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="5" />
        <circle cx="20" cy="20" r="7" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function AppLayout({ children, wide = false }) {
  const { user, profile, isAdmin, signOut } = useAuth()

  return (
    <div className="app-page">
      <TreadBackground />
      <header className="app-header">
        <Link to="/" className="brand brand--small">
          <BrandLogo />
          <span className="brand-name">{APP_NAME}</span>
        </Link>
        <nav className="header-right">
          {user ? (
            <>
              <NavLink to="/moje-rezervacije" className="nav-link">Moje rezervacije</NavLink>
              {isAdmin && <NavLink to="/admin" className="admin-link">Admin</NavLink>}
              <span className="user-name">{profile?.full_name}</span>
              <button className="btn-link" onClick={signOut}>Odjavi se</button>
            </>
          ) : (
            <Link to="/login" className="btn-link">Prijavi se</Link>
          )}
        </nav>
      </header>
      <main className={`app-main ${wide ? 'app-main--wide' : ''}`}>{children}</main>
    </div>
  )
}
