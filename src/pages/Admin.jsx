import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout.jsx'
import { errorMessage, supabase } from '../supabase.js'
import { PACKAGES, STATUSES, formatDate, formatRsd, windowLabel } from '../config.js'

const FILTERS = [
  { id: 'active', label: 'Aktivne', match: (b) => ['pending', 'confirmed', 'in_progress'].includes(b.status) },
  { id: 'pending', label: 'Na čekanju', match: (b) => b.status === 'pending' },
  { id: 'storage', label: 'Čuvanje guma', match: (b) => b.storage && b.status !== 'cancelled' },
  { id: 'done', label: 'Završene', match: (b) => b.status === 'done' },
  { id: 'all', label: 'Sve', match: () => true },
]

const mapsLink = (b) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address}, ${b.city}`)}`

export default function Admin() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, email), cars(make_model, plate, tire_size, summer_tires, winter_tires)')
      .order('date', { ascending: true })
      .order('pickup_from', { ascending: true })
    if (error) setError(errorMessage(error))
    setBookings(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (id, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) return setError(errorMessage(error))
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const stats = useMemo(() => {
    const list = bookings || []
    return {
      pending: list.filter((b) => b.status === 'pending').length,
      upcoming: list.filter((b) => ['confirmed', 'in_progress'].includes(b.status)).length,
      tiresStored: list.filter((b) => b.storage && b.status !== 'cancelled').reduce((sum, b) => sum + b.tires, 0),
      revenue: list.filter((b) => b.status === 'done').reduce((sum, b) => sum + b.price_total, 0),
    }
  }, [bookings])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const match = FILTERS.find((f) => f.id === filter).match
    return (bookings || []).filter(
      (b) =>
        match(b) &&
        (!q || [b.profiles?.full_name, b.profiles?.email, b.phone, b.address, b.city].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [bookings, filter, search])

  return (
    <AppLayout wide>
      <h1 className="page-title">Admin panel</h1>

      <div className="stats">
        <div className="card stat"><span>Na čekanju</span><strong>{stats.pending}</strong></div>
        <div className="card stat"><span>Potvrđeno / u toku</span><strong>{stats.upcoming}</strong></div>
        <div className="card stat"><span>Guma u skladištu</span><strong>{stats.tiresStored}</strong></div>
        <div className="card stat"><span>Zarada (završeno)</span><strong>{formatRsd(stats.revenue)}</strong></div>
      </div>

      <div className="admin-toolbar">
        <div className="filters">
          {FILTERS.map((f) => (
            <button key={f.id} className={`chip ${filter === f.id ? 'chip--active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Pretraga: ime, telefon, adresa…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="error">{error}</p>}

      {bookings === null ? (
        <div className="card empty">Učitavanje…</div>
      ) : visible.length === 0 ? (
        <div className="card empty">Nema rezervacija.</div>
      ) : (
        <div className="admin-list">
          {visible.map((b) => (
            <article key={b.id} className={`card admin-booking ${b.status === 'cancelled' ? 'booking--cancelled' : ''}`}>
              <div className="admin-when">
                <strong>{formatDate(b.date)}</strong>
                <span>{windowLabel(b)}</span>
              </div>
              <div className="admin-who">
                <strong>{b.profiles?.full_name || '—'}</strong>
                <a href={`tel:${b.phone}`}>{b.phone}</a>
                <span className="muted-sm">{b.profiles?.email}</span>
              </div>
              <div className="admin-where">
                <a href={mapsLink(b)} target="_blank" rel="noreferrer">📍 {b.address}, {b.city}</a>
                {b.note && <span className="muted-sm">„{b.note}“</span>}
              </div>
              <div className="admin-what">
                <span>{PACKAGES[b.package_id].name} · {b.tires} gume</span>
                {b.cars && (
                  <span className="muted-sm">
                    🚗 {b.cars.make_model}{b.cars.plate ? ` · ${b.cars.plate}` : ''}{b.cars.tire_size ? ` · ${b.cars.tire_size}` : ''}
                  </span>
                )}
                {b.storage && <span className="tag">Čuvanje guma</span>}
                <strong>{formatRsd(b.price_total)}</strong>
              </div>
              <select className={`status-select status--${b.status}`} value={b.status} onChange={(e) => changeStatus(b.id, e.target.value)}>
                {Object.entries(STATUSES).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
