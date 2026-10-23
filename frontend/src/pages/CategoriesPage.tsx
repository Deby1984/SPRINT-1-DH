import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriesApi, isApiError } from '../api'
import { FieldError, fieldErrorAttributes } from '../components/FieldError'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { Category, FieldErrors } from '../types'
import { errorMessage } from '../utils/product'
import { validateCategory } from '../utils/validation'

export function CategoriesPage() {
  const operationLock = useRef(false)
  const [items, setItems] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)
  const busy = saving || removing !== null

  const load = useCallback(async () => {
    try {
      setItems(await categoriesApi.list())
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudieron cargar las categorías.'))
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
    const validation = validateCategory({
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      imageUrl: String(form.get('imageUrl') ?? ''),
    })
    setError('')
    setFieldErrors(validation.errors)
    if (!validation.valid) return

    operationLock.current = true
    setSaving(true)
    try {
      if (editing) await categoriesApi.update(editing.id, validation.values)
      else await categoriesApi.create(validation.values)
      setEditing(null)
      setFieldErrors({})
      element.reset()
      await load()
    } catch (reason) {
      if (isApiError(reason)) setFieldErrors(reason.fieldErrors)
      setError(errorMessage(reason, 'No se pudo guardar la categoría.'))
    } finally {
      operationLock.current = false
      setSaving(false)
    }
  }

  async function remove(item: Category) {
    if (operationLock.current || !confirm(`¿Eliminar la categoría “${item.title}”?`)) return
    operationLock.current = true
    setRemoving(item.id)
    setError('')
    setFieldErrors({})
    try {
      await categoriesApi.remove(item.id)
      await load()
    } catch (reason) {
      setError(errorMessage(reason, 'No se puede eliminar una categoría utilizada por productos.'))
    } finally {
      operationLock.current = false
      setRemoving(null)
    }
  }

  function startEditing(item: Category | null) {
    if (operationLock.current) return
    setEditing(item)
    setError('')
    setFieldErrors({})
  }

  return <Layout><section className="admin-page wide">
    <Link to="/administracion" className="text-link">← Administración</Link>
    <p className="kicker">ORGANIZACIÓN DEL CATÁLOGO</p>
    <h1>Categorías</h1>
    <div className="management-grid">
      <form onSubmit={submit} className="stack-form" noValidate aria-busy={saving}>
        <h2>{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <label>Título
          <input name="title" required maxLength={60} defaultValue={editing?.title} key={`title-${editing?.id}`} disabled={busy} {...fieldErrorAttributes(fieldErrors, 'title')} />
          <FieldError errors={fieldErrors} name="title" />
        </label>
        <label>Descripción
          <textarea name="description" required maxLength={500} rows={4} defaultValue={editing?.description} key={`description-${editing?.id}`} disabled={busy} {...fieldErrorAttributes(fieldErrors, 'description')} />
          <FieldError errors={fieldErrors} name="description" />
        </label>
        <label>URL de imagen
          <input name="imageUrl" type="url" required maxLength={2048} defaultValue={editing?.imageUrl} key={`image-${editing?.id}`} disabled={busy} {...fieldErrorAttributes(fieldErrors, 'imageUrl')} />
          <FieldError errors={fieldErrors} name="imageUrl" />
        </label>
        <button className="primary" disabled={busy}>{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar categoría'}</button>
        {editing && <button type="button" className="ghost" disabled={busy} onClick={() => startEditing(null)}>Cancelar edición</button>}
      </form>
      <div>
        {error && <StatusMessage kind="error">{error}</StatusMessage>}
        {loading ? <StatusMessage>Cargando…</StatusMessage> : <div className="admin-cards">{items.map(item => <article key={item.id}>
          <img src={item.imageUrl} alt="" />
          <div><h3>{item.title}</h3><p>{item.description}</p>
            <button className="text-button" disabled={busy} onClick={() => startEditing(item)}>Editar</button>
            <button className="delete" disabled={busy} onClick={() => remove(item)}>{removing === item.id ? 'Eliminando…' : 'Eliminar'}</button>
          </div>
        </article>)}</div>}
      </div>
    </div>
  </section></Layout>
}
