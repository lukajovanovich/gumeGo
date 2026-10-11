import TreadBackground from './TreadBackground.jsx'
import { BrandLogo } from './AppLayout.jsx'
import { APP_NAME, APP_TAGLINE } from '../config.js'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <TreadBackground />
      <main className="auth-card">
        <div className="brand">
          <BrandLogo />
          <div>
            <div className="brand-name">{APP_NAME}</div>
            <div className="brand-tagline">{APP_TAGLINE}</div>
          </div>
        </div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        {children}
      </main>
    </div>
  )
}
