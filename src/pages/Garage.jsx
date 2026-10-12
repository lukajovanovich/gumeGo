import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage, supabase } from '../supabase.js'

const EMPTY_CAR = { make_model: '', plate: '', tire_size: '', summer_tires: '', winter_tires: '', two_sets: false }

function CarForm({ initial, onSave, onCancel }) {
  const [car, setCar] = useState(initial)
  const [busy, setBusy] = useState(false)
  const update = (e) => setCar({ ...car, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSave(car)
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="card form car-form">
      <h2>{initial.id ? 'Izmena vozila' : 'Novo vozilo'}</h2>
      <div className="row">
        <label>
          Marka i model
          <input name="make_model" value={car.make_model} onChange={update} placeholder="npr. VW Golf 7" required />
        </label>
        <label>
          <span>Registracija <span className="optional">(opciono)</span></span>
          <input name="plate" value={car.plate} onChange={update} placeholder="BG 123-AB" />
        </label>
      </div>
      <label>
        <span>Dimenzija guma <span className="optional">(piše na boku gume)</span></span>
        <input name="tire_size" value={car.tire_size} onChange={update} placeholder="npr. 205/55 R16" />
      </label>
      <div className="row">
        <label>
          <span>Letnje gume <span className="optional">(opciono)</span></span>
          <input name="summer_tires" value={car.summer_tires} onChange={update} placeholder="npr. Michelin Primacy 4" />
        </label>
        <label>
          <span>Zimske gume <span className="optional">(opciono)</span></span>
          <input name="winter_tires" value={car.winter_tires} onChange={update} placeholder="npr. Sava Eskimo HP2" />
        </label>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={car.two_sets} onChange={(e) => setCar({ ...car, two_sets: e.target.checked })} />
        <span>
          <strong>Imam 2 seta felni</strong>
          <small>I letnje i zimske gume su na svojim felnama, pa ih menjamo na licu mesta.</small>
        </span>
      </label>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Otkaži</button>
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Čuvam…' : 'Sačuvaj'}</button>
      </div>
    </form>
  )
}

export default function Garage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState(null)
  const [editing, setEditing] = useState(null) // null | EMPTY_CAR | postojeći auto
  const [error, setError] = useState('')

  const load = async () => {
    const { data, error } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at')
    if (error) setError(errorMessage(error))
    setCars(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const save = async ({ id, user_id, created_at, ...fields }) => {
    setError('')
    const { error } = id
      ? await supabase.from('cars').update(fields).eq('id', id)
      : await supabase.from('cars').insert({ ...fields, user_id: user.id })
    if (error) return setError(errorMessage(error))
    setEditing(null)
    load()
  }

  const remove = async (car) => {
    if (!confirm(`Obrisati ${car.make_model} iz garaže?`)) return
    const { error } = await supabase.from('cars').delete().eq('id', car.id)
    if (error) return setError(errorMessage(error))
    load()
  }

  return (
    <AppLayout>
      <section className="intro intro--row">
        <div>
          <h1>Moja garaža</h1>
          <p className="muted">Sačuvajte svoja vozila i gume, pa pri sledećoj rezervaciji samo izaberite auto.</p>
        </div>
        {!editing && (
          <button className="btn-primary btn-inline" onClick={() => setEditing(EMPTY_CAR)}>+ Dodaj vozilo</button>
        )}
      </section>

      {error && <p className="error">{error}</p>}

      {editing && <CarForm key={editing.id || 'new'} initial={editing} onSave={save} onCancel={() => setEditing(null)} />}

      {cars === null ? (
        <div className="card empty">Učitavanje…</div>
      ) : cars.length === 0 ? (
        !editing && <div className="card empty">Garaža je prazna. Dodajte svoje prvo vozilo.</div>
      ) : (
        <div className="car-list">
          {cars.map((car) => (
            <article key={car.id} className="card car">
              <div className="car-top">
                <div>
                  <h3>{car.make_model}</h3>
                  {car.plate && <span className="plate">{car.plate}</span>}
                </div>
                <span className={`tag ${car.two_sets ? 'tag--green' : ''}`}>{car.two_sets ? '2 seta felni' : '1 set felni'}</span>
              </div>
              <dl className="car-details">
                <dt>Dimenzija</dt>
                <dd>{car.tire_size || '—'}</dd>
                <dt>☀️ Letnje</dt>
                <dd>{car.summer_tires || '—'}</dd>
                <dt>❄️ Zimske</dt>
                <dd>{car.winter_tires || '—'}</dd>
              </dl>
              <div className="car-actions">
                <button className="btn-primary btn-small" onClick={() => navigate('/', { state: { carId: car.id } })}>
                  Zakaži zamenu
                </button>
                <button className="btn-link" onClick={() => setEditing(car)}>Izmeni</button>
                <button className="btn-link btn-link--danger" onClick={() => remove(car)}>Obriši</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
