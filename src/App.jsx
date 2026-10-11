import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import { useAuth } from './AuthContext.jsx'

function Loading() {
  return <div className="loading-screen">Učitavanje…</div>
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <Loading />
  return session ? children : <Navigate to="/login" replace />
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
  if (loading) return <Loading />
  return session ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/registracija" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/rezervacija" element={<RequireAuth><Booking /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
