import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage, supabase } from '../supabase.js'
import { PACKAGES, STATUSES, formatDate, formatRsd, windowLabel } from '../config.js'

export default function Home() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const justBooked = location.state?.booked

  const load = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, cars(make_model)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) setError(errorMessage(error))
    setBookings(data || [])
  }

  useEffect(() => {
    load()
  }, [location.key]) // ponovo učitaj i kad stigne nova rezervacija posle prijave

  const cancel = async (id) => {
    if (!confirm('Da li sigurno želite da otkažete rezervaciju?')) return
    const { error } = await supabase.rpc('cancel_booking', { booking_id: id })
    if (error) return setError(errorMessage(error))
    load()
  }

  return (
    <AppLayout>
      {justBooked && <div className="banner-success">Rezervacija je poslata! Javićemo vam se da potvrdimo termin.</div>}

      <section className="hero card">
        <div>
          <h1>Zdravo, {profile?.full_name.split(' ')[0] || 'dobro došli'}!</h1>
          <p className="muted">Zakažite zamenu guma, a mi dolazimo do vašeg auta.</p>
        </div>
        <Link to="/" className="btn-primary btn-inline">+ Nova rezervacija</Link>
      </section>

      <h2 className="section-title">Moje rezervacije</h2>
      {error && <p className="error">{error}</p>}
      {bookings === null ? (
        <div className="card empty">Učitavanje…</div>
      ) : bookings.length === 0 ? (
        <div className="card empty">Još nemate rezervacija.</div>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <article key={b.id} className={`card booking ${b.status === 'cancelled' ? 'booking--cancelled' : ''}`}>
              <div className="booking-top">
                <strong>{PACKAGES[b.package_id].name}</strong>
                <span className={`status status--${b.status}`}>{STATUSES[b.status]}</span>
              </div>
              <div className="booking-details">
                <span>📅 {formatDate(b.date)}, {windowLabel(b)}</span>
                <span>📍 {b.address}, {b.city}</span>
                {b.cars && <span>🚗 {b.cars.make_model}</span>}
                <span>🛞 {b.tires} gume{b.storage ? ' · čuvanje guma' : ''}</span>
              </div>
              <div className="booking-bottom">
                <span className="price">{formatRsd(b.price_total)}</span>
                {b.status === 'pending' && (
                  <button className="btn-link btn-link--danger" onClick={() => cancel(b.id)}>Otkaži</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
