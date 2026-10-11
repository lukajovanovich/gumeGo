import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import AuthForm from '../components/AuthForm.jsx'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage } from '../supabase.js'
import { clearDraft, loadDraft, markPending, saveDraft, submitBooking } from '../draft.js'
import { PACKAGES, PRICES, TIME_SLOTS, calcPrice, formatRsd } from '../config.js'

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const STORAGE_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const monthsLabel = (m) => (m === 1 ? 'mesec' : m < 5 ? 'meseca' : 'meseci')

const EMPTY_FORM = {
  packageId: 'twoSets',
  tires: 4,
  address: '',
  city: 'Beograd',
  phone: '',
  note: '',
  date: '',
  slot: '',
  storage: false,
  storageMonths: 6,
}

export default function Booking() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...loadDraft() }))
  const [error, setError] = useState(location.state?.error || '')
  const [busy, setBusy] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))
  const update = (e) => set(e.target.name, e.target.value)
  const price = calcPrice(form)
  const pkg = PACKAGES[form.packageId]

  // Čuva unete podatke dok korisnik popunjava (preživi osvežavanje i prijavu)
  useEffect(() => {
    saveDraft(form)
  }, [form])

  useEffect(() => {
    if (profile?.phone && !form.phone) set('phone', profile.phone)
  }, [profile])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.slot) return setError('Izaberite termin.')
    setError('')

    if (!user) {
      markPending()
      setShowAuth(true)
      return
    }

    setBusy(true)
    const { error } = await submitBooking(user.id, form)
    setBusy(false)
    if (error) return setError(errorMessage(error))
    clearDraft()
    navigate('/moje-rezervacije', { state: { booked: true } })
  }

  return (
    <AppLayout>
      <section className="intro">
        <h1>Zamena guma na vašoj adresi</h1>
        <p className="muted">Izaberite paket, recite nam gde je auto i kada vam odgovara. Ostalo je na nama.</p>
      </section>

      <form onSubmit={submit} className="booking-layout">
        <div className="booking-steps">
          <section className="card step">
            <h2><span className="step-num">1</span> Izaberite paket</h2>
            <div className="package-grid">
              {Object.values(PACKAGES).map((p) => (
                <label key={p.id} className={`package ${form.packageId === p.id ? 'package--active' : ''}`}>
                  <input type="radio" name="packageId" value={p.id} checked={form.packageId === p.id} onChange={update} />
                  <span className="package-name">{p.name}</span>
                  <span className="package-price">{formatRsd(p.pricePerTire)} <small>/ guma</small></span>
                  <span className="package-desc">{p.description}</span>
                </label>
              ))}
            </div>
            <div className="field-inline">
              <span>Broj guma</span>
              <div className="segmented">
                {[2, 4].map((n) => (
                  <button type="button" key={n} className={form.tires === n ? 'active' : ''} onClick={() => set('tires', n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card step">
            <h2><span className="step-num">2</span> Gde se nalazi auto?</h2>
            <div className="form">
              <div className="row row--address">
                <label>
                  Adresa
                  <input name="address" value={form.address} onChange={update} placeholder="Ulica i broj" required />
                </label>
                <label>
                  Grad
                  <input name="city" value={form.city} onChange={update} required />
                </label>
              </div>
              <label>
                Kontakt telefon
                <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="06x xxx xxxx" required autoComplete="tel" />
              </label>
              <label>
                <span>Napomena <span className="optional">(opciono)</span></span>
                <textarea name="note" value={form.note} onChange={update} rows="3" placeholder="npr. auto je na parkingu iza zgrade, ključ kod portira" />
              </label>
            </div>
          </section>

          <section className="card step">
            <h2><span className="step-num">3</span> Termin</h2>
            <div className="form">
              <label>
                Datum
                <input type="date" name="date" value={form.date} onChange={update} min={tomorrow()} required />
              </label>
              <div className="slots">
                {TIME_SLOTS.map((s) => (
                  <button type="button" key={s} className={`slot ${form.slot === s ? 'slot--active' : ''}`} onClick={() => set('slot', s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card step">
            <h2><span className="step-num">4</span> Čuvanje guma</h2>
            <label className="toggle">
              <input type="checkbox" checked={form.storage} onChange={(e) => set('storage', e.target.checked)} />
              <span>
                <strong>Želim da mi čuvate gume do sledeće sezone</strong>
                <small>{formatRsd(PRICES.storagePerTirePerMonth)} po gumi mesečno. Gume čuvamo u suvom i bezbednom skladištu.</small>
              </span>
            </label>
            {form.storage && (
              <div className="field-inline">
                <span>Period čuvanja</span>
                <select value={form.storageMonths} onChange={(e) => set('storageMonths', Number(e.target.value))}>
                  {STORAGE_MONTHS.map((m) => (
                    <option key={m} value={m}>{m} {monthsLabel(m)}</option>
                  ))}
                </select>
              </div>
            )}
          </section>
        </div>

        <aside className="card summary">
          <h2>Pregled</h2>
          <div className="summary-line">
            <span>{pkg.name}<br /><small>{form.tires} × {formatRsd(pkg.pricePerTire)}</small></span>
            <span>{formatRsd(price.service)}</span>
          </div>
          {form.storage && (
            <div className="summary-line">
              <span>Čuvanje guma<br /><small>{formatRsd(price.storageMonthly)} / mes. × {form.storageMonths}</small></span>
              <span>{formatRsd(price.storageTotal)}</span>
            </div>
          )}
          <div className="summary-total">
            <span>Ukupno</span>
            <span>{formatRsd(price.total)}</span>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Šaljem…' : 'Pošalji rezervaciju'}</button>
          <p className="summary-note">Plaćanje nakon izvršene usluge.</p>
        </aside>
      </form>

      {showAuth && !user && (
        <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
          <div className="card modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" aria-label="Zatvori" onClick={() => setShowAuth(false)}>×</button>
            <h2>Još samo jedan korak</h2>
            <p className="muted">
              Napravite nalog ili se prijavite da bismo poslali rezervaciju ({formatRsd(price.total)}). Vaši podaci su sačuvani.
            </p>
            <AuthForm initialMode="register" phone={form.phone} redirectPath="/" />
          </div>
        </div>
      )}
    </AppLayout>
  )
}
