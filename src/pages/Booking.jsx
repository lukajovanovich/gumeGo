import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import AuthForm from '../components/AuthForm.jsx'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage, supabase } from '../supabase.js'
import { EMPTY_FORM, clearDraft, loadDraft, markPending, saveDraft, submitBooking } from '../draft.js'
import { PACKAGES, PRICES, WINDOW, calcPrice, formatRsd, hourToTime } from '../config.js'

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)


// Drži prozor ispravnim: vraćanje uvek bar minHours posle preuzimanja
function normalizeWindow(f) {
  const gap = WINDOW.minHours[f.packageId]
  const pickupFrom = Math.min(f.pickupFrom, WINDOW.lastHour - gap)
  const returnBy = Math.max(f.returnBy, pickupFrom + gap)
  return { ...f, pickupFrom, returnBy }
}

const WINDOW_TEXT = {
  twoSets: {
    from: 'Auto je dostupan od',
    to: 'Auto je dostupan do',
    hint: 'Zamena traje oko 30 minuta. Dolazimo u bilo koje vreme u ovom periodu.',
  },
  oneSet: {
    from: 'Preuzimanje najranije u',
    to: 'Vraćanje najkasnije do',
    hint: 'Auto vozimo u skladište i vraćamo ga isti dan. Ceo posao traje oko 2 sata.',
  },
}

export default function Booking() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const [form, setForm] = useState(() => normalizeWindow({ ...EMPTY_FORM, ...loadDraft() }))
  const [cars, setCars] = useState([])
  const [error, setError] = useState(location.state?.error || '')
  const [busy, setBusy] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const set = (name, value) => setForm((f) => normalizeWindow({ ...f, [name]: value }))
  const update = (e) => set(e.target.name, e.target.value)
  const price = calcPrice(form)
  const pkg = PACKAGES[form.packageId]
  const gap = WINDOW.minHours[form.packageId]
  const windowText = WINDOW_TEXT[form.packageId]

  // Čuva unete podatke dok korisnik popunjava (preživi osvežavanje i prijavu)
  useEffect(() => {
    saveDraft(form)
  }, [form])

  useEffect(() => {
    if (profile?.phone && !form.phone) set('phone', profile.phone)
  }, [profile])

  // Vozila iz garaže; auto može da stigne i sa stranice Moja garaža
  useEffect(() => {
    if (!user) {
      setCars([])
      if (form.carId) set('carId', '')
      return
    }
    supabase
      .from('cars')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        const list = data || []
        setCars(list)
        const wanted = location.state?.carId || form.carId
        const car = list.find((c) => c.id === wanted)
        if (car) chooseCar(car)
        else if (form.carId) set('carId', '')
      })
  }, [user?.id])

  const chooseCar = (car) => {
    setForm((f) => normalizeWindow({ ...f, carId: car?.id || '', packageId: car ? (car.two_sets ? 'twoSets' : 'oneSet') : f.packageId }))
  }

  const submit = async (e) => {
    e.preventDefault()
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

            {user && (
              <div className="car-picker">
                {cars.length > 0 ? (
                  <label>
                    Vozilo
                    <select value={form.carId} onChange={(e) => chooseCar(cars.find((c) => c.id === e.target.value))}>
                      <option value="">— bez izbora vozila —</option>
                      {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.make_model}{c.plate ? ` · ${c.plate}` : ''}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="muted-sm">
                    Sačuvajte auto i gume u <Link to="/garaza">Mojoj garaži</Link> i sledeći put samo izaberite vozilo.
                  </p>
                )}
              </div>
            )}

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
              <div className="row">
                <label>
                  {windowText.from}
                  <select value={form.pickupFrom} onChange={(e) => set('pickupFrom', Number(e.target.value))}>
                    {range(WINDOW.firstHour, WINDOW.lastHour - gap).map((h) => (
                      <option key={h} value={h}>{hourToTime(h)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {windowText.to}
                  <select value={form.returnBy} onChange={(e) => set('returnBy', Number(e.target.value))}>
                    {range(form.pickupFrom + gap, WINDOW.lastHour).map((h) => (
                      <option key={h} value={h}>{hourToTime(h)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="muted-sm">{windowText.hint}</p>
            </div>
          </section>

          <section className="card step">
            <h2><span className="step-num">4</span> Čuvanje guma</h2>
            <label className="toggle">
              <input type="checkbox" checked={form.storage} onChange={(e) => set('storage', e.target.checked)} />
              <span>
                <strong>Želim da mi čuvate gume do sledeće sezone</strong>
                <small>
                  {formatRsd(PRICES.storagePerTirePerMonth)} po gumi mesečno, naplaćuje se svakog meseca dok su gume kod nas.
                  Gume čuvamo u suvom i bezbednom skladištu.
                </small>
              </span>
            </label>
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
              <span>Čuvanje guma, prvi mesec<br /><small>{form.tires} × {formatRsd(PRICES.storagePerTirePerMonth)}</small></span>
              <span>{formatRsd(price.storageMonthly)}</span>
            </div>
          )}
          <div className="summary-total">
            <span>Ukupno</span>
            <span>{formatRsd(price.total)}</span>
          </div>
          {form.storage && (
            <p className="summary-note">Zatim {formatRsd(price.storageMonthly)} mesečno za čuvanje guma.</p>
          )}
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
