import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { characteristicsApi, isApiError } from '../api'
import { FieldError, fieldErrorAttributes } from '../components/FieldError'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { Characteristic, FieldErrors } from '../types'
import { errorMessage } from '../utils/product'
import { validateCharacteristic } from '../utils/validation'

export function CharacteristicsPage() {
  const operationLock = useRef(false)
  const [items, setItems] = useState<Characteristic[]>([])
  const [editing, setEditing] = useState<Characteristic | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)
  const busy = saving || removing !== null

  const load = useCallback(async () => {
    try {
      setItems(await characteristicsApi.list())
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudieron cargar las características.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operationLock.current) return

    const element = event.currentTarget
    const form = new FormData(element)
    const validation = validateCharacteristic({
      name: String(form.get('name') ?? ''),
      icon: String(form.get('icon') ?? ''),
    })
    setError('')
    setFieldErrors(validation.errors)
    if (!validation.valid) return

    operationLock.current = true
    setSaving(true)
    try {
      if (editing) await characteristicsApi.update(editing.id, validation.values)
      else await characteristicsApi.create(validation.values)
      setEditing(null)
      setFieldErrors({})
      element.reset()
      await load()
    } catch (reason) {
      if (isApiError(reason)) setFieldErrors(reason.fieldErrors)
      setError(errorMessage(reason, 'No se pudo guardar la característica.'))
    } finally {
      operationLock.current = false
      setSaving(false)
    }
  }

  async function remove(item: Characteristic) {
    if (operationLock.current || !confirm(`¿Eliminar “${item.name}”?`)) return
    operationLock.current = true
    setRemoving(item.id)
    setError('')
    setFieldErrors({})
    try {
      await characteristicsApi.remove(item.id)
      await load()
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudo eliminar.'))
    } finally {
      operationLock.current = false
      setRemoving(null)
    }
  }

  function startEditing(item: Characteristic | null) {
    if (operationLock.current) return
    setEditing(item)
    setError('')
    setFieldErrors({})
  }

  return <Layout><section className="admin-page wide">
    <Link to="/administracion" className="text-link">← Administración</Link>
    <p className="kicker">SERVICIOS DEL ALOJAMIENTO</p>
    <h1>Características</h1>
    <div className="management-grid">
      <form onSubmit={submit} className="stack-form" noValidate aria-busy={saving}>
        <h2>{editing ? 'Editar característica' : 'Nueva característica'}</h2>
        <label>Nombre
          <input name="name" required maxLength={60} defaultValue={editing?.name} key={`name-${editing?.id}`} disabled={busy} {...fieldErrorAttributes(fieldErrors, 'name')} />
          <FieldError errors={fieldErrors} name="name" />
        </label>
        <label>Ícono o emoji
          <input name="icon" required maxLength={24} defaultValue={editing?.icon} key={`icon-${editing?.id}`} disabled={busy} {...fieldErrorAttributes(fieldErrors, 'icon')} />
          <FieldError errors={fieldErrors} name="icon" />
        </label>
        <button className="primary" disabled={busy}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar característica'}</button>
        {editing && <button type="button" className="ghost" disabled={busy} onClick={() => startEditing(null)}>Cancelar edición</button>}
      </form>
      <div>
        {error && <StatusMessage kind="error">{error}</StatusMessage>}
        {loading ? <StatusMessage>Cargando…</StatusMessage> : <div className="feature-admin-list">{items.map(item => <article key={item.id}>
          <span>{item.icon}</span><b>{item.name}</b>
          <button className="text-button" disabled={busy} onClick={() => startEditing(item)}>Editar</button>
          <button className="delete" disabled={busy} onClick={() => remove(item)}>{removing === item.id ? 'Eliminando…' : 'Eliminar'}</button>
        </article>)}</div>}
      </div>
    </div>
  </section></Layout>
}
