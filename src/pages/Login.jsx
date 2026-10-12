import { Link, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import AuthForm from '../components/AuthForm.jsx'

export default function Login() {
  const from = useLocation().state?.from || '/moje-rezervacije'
  return (
    <AuthLayout title="Prijava" subtitle="Prijavite se da vidite svoje rezervacije i garažu.">
      <AuthForm initialMode="login" redirectPath={from} />
      <p className="switch">
        <Link to="/">← Zakažite zamenu guma</Link>
      </p>
    </AuthLayout>
  )
}
