import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi, isApiError, tokenStore } from '../api'
import { useAuth } from '../auth'
import { FieldError, fieldErrorAttributes } from '../components/FieldError'
import { Layout } from '../components/layout/Layout'
import type { FieldErrors } from '../types'
import { errorMessage } from '../utils/product'
import { validateLogin, validateRegister } from '../utils/validation'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const submitting = useRef(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const registering = mode === 'register'

  if (user) return <Navigate to={user.role === 'ADMIN' ? '/administracion' : '/'} replace />

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const form = new FormData(event.currentTarget)
    const credentials = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    }
    const validation = registering
      ? validateRegister({
          ...credentials,
          firstName: String(form.get('firstName') ?? ''),
          lastName: String(form.get('lastName') ?? ''),
        })
      : validateLogin(credentials)

    setError('')
    setFieldErrors(validation.errors)
    if (!validation.valid) return

    submitting.current = true
    setSaving(true)
    try {
      const result = registering
        ? await authApi.register(validation.values as ReturnType<typeof validateRegister>['values'])
        : await authApi.login(validation.values)
      tokenStore.set(result.token)
      setUser(result.user)
      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested ?? (result.user.role === 'ADMIN' ? '/administracion' : '/'), { replace: true })
    } catch (reason) {
      if (isApiError(reason)) setFieldErrors(reason.fieldErrors)
      setError(errorMessage(reason, 'No se pudo completar la operación.'))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return <Layout><section className="auth-page">
    <div className="auth-copy">
      <p className="kicker">{registering ? 'SUMATE A HORIZONTE' : 'QUÉ BUENO VERTE'}</p>
      <h1>{registering ? 'Creá tu cuenta.' : 'Iniciá sesión.'}</h1>
      <p>{registering ? 'Registrate para acceder a las funciones personales.' : 'Ingresá con tu correo y contraseña para continuar.'}</p>
    </div>
    <form onSubmit={submit} className="auth-form" noValidate aria-busy={saving}>
      {registering && <>
        <label>Nombre
          <input name="firstName" required maxLength={60} autoComplete="given-name" disabled={saving} {...fieldErrorAttributes(fieldErrors, 'firstName')} />
          <FieldError errors={fieldErrors} name="firstName" />
        </label>
        <label>Apellido
          <input name="lastName" required maxLength={60} autoComplete="family-name" disabled={saving} {...fieldErrorAttributes(fieldErrors, 'lastName')} />
          <FieldError errors={fieldErrors} name="lastName" />
        </label>
      </>}
      <label>Correo electrónico
        <input name="email" required type="email" maxLength={160} autoComplete="email" disabled={saving} {...fieldErrorAttributes(fieldErrors, 'email')} />
        <FieldError errors={fieldErrors} name="email" />
      </label>
      <label>Contraseña
        <input name="password" required type="password" minLength={8} maxLength={72} autoComplete={registering ? 'new-password' : 'current-password'} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'password')} />
        <small>Mínimo 8 caracteres.</small>
        <FieldError errors={fieldErrors} name="password" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary" disabled={saving}>{saving ? 'Procesando…' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</button>
      <p>{registering ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'}{' '}
        <Link to={registering ? '/login' : '/registro'} aria-disabled={saving} onClick={event => { if (saving) event.preventDefault() }}>
          {registering ? 'Iniciá sesión' : 'Registrate'}
        </Link>
      </p>
    </form>
  </section></Layout>
}
