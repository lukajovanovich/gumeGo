import { NavLink } from 'react-router-dom'

export default function AdminTabs() {
  return (
    <div className="admin-tabs">
      <NavLink to="/admin" end>📋 Rezervacije</NavLink>
      <NavLink to="/admin/skladiste">🛞 Skladište</NavLink>
    </div>
  )
}
