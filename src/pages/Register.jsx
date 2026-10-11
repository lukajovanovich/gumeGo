import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { errorMessage, supabase } from '../supabase.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return setError('Lozinka mora imati najmanje 6 karaktera.')
    if (form.password !== form.confirm) return setError('Lozinke se ne poklapaju.')
    setBusy(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim(), phone: form.phone.trim() } },
    })
    setBusy(false)
    if (error) return setError(errorMessage(error))
    // Ako je u Supabase-u uključena potvrda emaila, sesija stiže tek posle klika na link
    if (!data.session) setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <AuthLayout title="Proverite email" subtitle={`Poslali smo link za potvrdu na ${form.email}. Kliknite na njega pa se prijavite.`}>
        <Link to="/login" className="btn-primary btn-inline btn-block">Na prijavu</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Registracija" subtitle="Napravite nalog za par sekundi.">
      <form onSubmit={submit} className="form">
        <label>
          Ime i prezime
          <input name="name" value={form.name} onChange={update} placeholder="Marko Marković" required autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={update} placeholder="ime@primer.rs" required autoComplete="email" />
        </label>
        <label>
          Broj telefona
          <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="06x xxx xxxx" required autoComplete="tel" />
        </label>
        <label>
          Lozinka
          <input type="password" name="password" value={form.password} onChange={update} required autoComplete="new-password" />
        </label>
        <label>
          Ponovi lozinku
          <input type="password" name="confirm" value={form.confirm} onChange={update} required autoComplete="new-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Pravim nalog…' : 'Napravi nalog'}</button>
      </form>
      <p className="switch">
        Već imate nalog? <Link to="/login">Prijavite se</Link>
      </p>
    </AuthLayout>
  )
}
