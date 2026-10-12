import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Zatvori meni na telefonu kad se pređe na drugu stranicu
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <div className="app-page">
      <TreadBackground />
      <header className="app-header">
        <Link to="/" className="brand brand--small">
          <BrandLogo />
          <span className="brand-name">{APP_NAME}</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Meni"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`header-menu ${menuOpen ? 'header-menu--open' : ''}`}>
          <nav className="main-nav">
            <NavLink to="/" end className="nav-link">Zakaži</NavLink>
            <NavLink to="/garaza" className="nav-link">Moja garaža</NavLink>
            {user && <NavLink to="/moje-rezervacije" className="nav-link">Moje rezervacije</NavLink>}
            <NavLink to="/o-nama" className="nav-link">O nama</NavLink>
            {isAdmin && <NavLink to="/admin" className="admin-link">Admin</NavLink>}
          </nav>
          <div className="header-account">
            {user ? (
              <>
                <span className="user-name">{profile?.full_name}</span>
                <button className="btn-link" onClick={signOut}>Odjavi se</button>
              </>
            ) : (
              <Link to="/login" className="btn-link">Prijavi se</Link>
            )}
          </div>
        </div>
      </header>
      <main className={`app-main ${wide ? 'app-main--wide' : ''}`}>{children}</main>
    </div>
  )
}
