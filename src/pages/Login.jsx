import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import AuthForm from '../components/AuthForm.jsx'

export default function Login() {
  return (
    <AuthLayout title="Prijava" subtitle="Prijavite se da vidite svoje rezervacije.">
      <AuthForm initialMode="login" redirectPath="/moje-rezervacije" />
      <p className="switch">
        <Link to="/">← Zakažite zamenu guma</Link>
      </p>
    </AuthLayout>
  )
}
