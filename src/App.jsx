import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import Garage from './pages/Garage.jsx'
import About from './pages/About.jsx'
import AdminStorage from './pages/AdminStorage.jsx'
import TireSet from './pages/TireSet.jsx'
import { useAuth } from './AuthContext.jsx'
import { clearDraft, clearPending, isPending, loadDraft, submitBooking } from './draft.js'
import { errorMessage } from './supabase.js'

function Loading() {
  return <div className="loading-screen">Učitavanje…</div>
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  // Pamti stranicu, da se posle prijave korisnik vrati na nju
  return session ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

// Samo sakriva stranicu – pravu zaštitu podataka radi baza (RLS u supabase/schema.sql)
function RequireAdmin({ children }) {
  const { session, isAdmin, loading } = useAuth()
  if (loading) return <Loading />
  if (!session) return <Navigate to="/login" replace />
  return isAdmin ? children : <Navigate to="/" replace />
}

function GuestOnly({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  return session ? <Navigate to={location.state?.from || '/moje-rezervacije'} replace /> : children
}

// Kad se korisnik prijavi/registruje usred rezervacije, šalje sačuvanu rezervaciju
function PendingBooking() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    if (!user || started.current || !isPending()) return
    const draft = loadDraft()
    if (!draft) return clearPending()
    started.current = true
    clearPending()
    submitBooking(user.id, draft).then(({ error }) => {
      started.current = false
      if (error) {
        navigate('/', { state: { error: errorMessage(error) } })
      } else {
        clearDraft()
        navigate('/moje-rezervacije', { state: { booked: true } })
      }
    })
  }, [user])

  return null
}

export default function App() {
  return (
    <>
      <PendingBooking />
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/moje-rezervacije" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/garaza" element={<RequireAuth><Garage /></RequireAuth>} />
        <Route path="/o-nama" element={<About />} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="/admin/skladiste" element={<RequireAdmin><AdminStorage /></RequireAdmin>} />
        <Route path="/skladiste/:id" element={<RequireAuth><TireSet /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
