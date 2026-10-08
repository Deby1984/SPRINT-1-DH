import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../auth'
import { Layout } from '../components/layout/Layout'
import { errorMessage } from '../utils/product'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/administracion' : '/'} replace />
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const nextUser = mode === 'login'
        ? await authApi.login({ email: String(form.get('email')), password: String(form.get('password')) })
        : await authApi.register({ firstName: String(form.get('firstName')), lastName: String(form.get('lastName')), email: String(form.get('email')), password: String(form.get('password')) })
      setUser(nextUser)
      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested ?? (nextUser.role === 'ADMIN' ? '/administracion' : '/'), { replace: true })
    } catch (reason) { setError(errorMessage(reason, 'No se pudo completar la operación.')) }
    finally { setSaving(false) }
  }
  const registering = mode === 'register'
  return <Layout><section className="auth-page"><div className="auth-copy"><p className="kicker">{registering ? 'SUMATE A HORIZONTE' : 'QUÉ BUENO VERTE'}</p><h1>{registering ? 'Creá tu cuenta.' : 'Iniciá sesión.'}</h1><p>{registering ? 'Registrate para acceder a las funciones personales.' : 'Ingresá con tu correo y contraseña para continuar.'}</p></div><form onSubmit={submit} className="auth-form">{registering && <><label>Nombre<input name="firstName" required maxLength={60} autoComplete="given-name" /></label><label>Apellido<input name="lastName" required maxLength={60} autoComplete="family-name" /></label></>}<label>Correo electrónico<input name="email" required type="email" autoComplete="email" /></label><label>Contraseña<input name="password" required type="password" minLength={8} maxLength={72} autoComplete={registering ? 'new-password' : 'current-password'} /><small>Mínimo 8 caracteres.</small></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary" disabled={saving}>{saving ? 'Procesando…' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</button><p>{registering ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'} <Link to={registering ? '/login' : '/registro'}>{registering ? 'Iniciá sesión' : 'Registrate'}</Link></p></form></section></Layout>
}
