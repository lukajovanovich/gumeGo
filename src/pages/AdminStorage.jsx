import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import AdminTabs from '../components/AdminTabs.jsx'
import { errorMessage, supabase } from '../supabase.js'
import { SEASONS, formatDay, signedPhotoUrls, storageMonth } from '../tireSets.js'

const FILTERS = [
  { id: 'stored', label: 'U skladištu' },
  { id: 'returned', label: 'Vraćene' },
  { id: 'all', label: 'Sve' },
]

export default function AdminStorage() {
  const [sets, setSets] = useState(null)
  const [thumbs, setThumbs] = useState({})
  const [filter, setFilter] = useState('stored')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('tire_sets')
      .select('*, profiles(full_name, phone), cars(make_model, plate)')
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error) setError(errorMessage(error))
        setSets(data || [])
        setThumbs(await signedPhotoUrls((data || []).map((s) => s.photos[0]).filter(Boolean)))
      })
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (sets || []).filter(
      (s) =>
        (filter === 'all' || s.status === filter) &&
        (!q || [s.code, s.profiles?.full_name, s.profiles?.phone, s.location, s.description, s.cars?.plate].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [sets, filter, search])

  const storedTires = (sets || []).filter((s) => s.status === 'stored').reduce((sum, s) => sum + s.tires, 0)

  return (
    <AppLayout wide>
      <h1 className="page-title">Admin panel</h1>
      <AdminTabs />

      <div className="stats stats--3">
        <div className="card stat"><span>Setova u skladištu</span><strong>{(sets || []).filter((s) => s.status === 'stored').length}</strong></div>
        <div className="card stat"><span>Guma u skladištu</span><strong>{storedTires}</strong></div>
        <div className="card stat"><span>Novi set</span><small className="muted-sm">Dodaje se iz rezervacije sa čuvanjem: dugme „Uskladišti gume“.</small></div>
      </div>

      <div className="admin-toolbar">
        <div className="filters">
          {FILTERS.map((f) => (
            <button key={f.id} className={`chip ${filter === f.id ? 'chip--active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Pretraga: šifra, ime, telefon, polica…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="error">{error}</p>}

      {sets === null ? (
        <div className="card empty">Učitavanje…</div>
      ) : visible.length === 0 ? (
        <div className="card empty">Nema guma u ovoj listi.</div>
      ) : (
        <div className="set-list">
          {visible.map((s) => (
            <Link key={s.id} to={`/skladiste/${s.id}`} className="card set-item">
              <div className="set-thumb">
                {s.photos[0] && thumbs[s.photos[0]] ? <img src={thumbs[s.photos[0]]} alt="" loading="lazy" /> : <span>🛞</span>}
              </div>
              <div className="set-info">
                <div className="set-item-top">
                  <strong className="set-code-sm">{s.code}</strong>
                  <span className="muted-sm">{SEASONS[s.season]} · {s.tires} kom</span>
                </div>
                <span>{s.profiles?.full_name} · {s.profiles?.phone}</span>
                {s.cars && <span className="muted-sm">🚗 {s.cars.make_model}{s.cars.plate ? ` · ${s.cars.plate}` : ''}</span>}
                <span className="muted-sm">
                  {s.location ? `📍 ${s.location} · ` : ''}
                  {s.status === 'stored' ? `od ${formatDay(s.stored_at)} · ${storageMonth(s.stored_at)}. mesec` : `vraćeno ${formatDay(s.returned_at)}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
