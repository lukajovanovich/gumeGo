import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { supabaseConfigured } from './supabase.js'
import './index.css'
import './app.css'

function SetupNotice() {
  return (
    <div className="loading-screen">
      <div className="card setup-notice">
        <h1>Baza nije povezana</h1>
        <p className="muted">
          Napravite fajl <code>.env</code> u folderu projekta (po uzoru na <code>.env.example</code>), upišite Supabase
          URL i ključ, pa ponovo pokrenite <code>npm run dev</code>.
        </p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {supabaseConfigured ? (
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    ) : (
      <SetupNotice />
    )}
  </React.StrictMode>,
)
