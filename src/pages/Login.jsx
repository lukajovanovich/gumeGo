import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { errorMessage, supabase } from '../supabase.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Posle uspešne prijave GuestOnly (App.jsx) sam preusmerava na početnu
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
    setBusy(false)
    if (error) setError(errorMessage(error))
  }

  return (
    <AuthLayout title="Prijava" subtitle="Dobro došli nazad! Prijavite se da zakažete zamenu guma.">
      <form onSubmit={submit} className="form">
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={update} placeholder="ime@primer.rs" required autoComplete="email" />
        </label>
        <label>
          Lozinka
          <input type="password" name="password" value={form.password} onChange={update} placeholder="••••••••" required autoComplete="current-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Prijava…' : 'Prijavi se'}</button>
      </form>
      <p className="switch">
        Nemate nalog? <Link to="/registracija">Registrujte se</Link>
      </p>
    </AuthLayout>
  )
}
