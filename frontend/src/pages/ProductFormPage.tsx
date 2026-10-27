import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { categoriesApi, characteristicsApi, isApiError, productsApi } from '../api'
import { FieldError, fieldErrorAttributes } from '../components/FieldError'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { Category, Characteristic, FieldErrors, Product } from '../types'
import { errorMessage } from '../utils/product'
import { validateProduct } from '../utils/validation'

export function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const submitting = useRef(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  function policy(title: string) {
    return product?.policies.find(item => item.title === title)?.description ?? ''
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setFieldErrors({})
    setProduct(null)
    Promise.all([
      categoriesApi.list(),
      characteristicsApi.list(),
      id ? productsApi.get(id) : Promise.resolve(null),
    ])
      .then(([nextCategories, nextCharacteristics, nextProduct]) => {
        if (!active) return
        setCategories(nextCategories)
        setCharacteristics(nextCharacteristics)
        setProduct(nextProduct)
      })
      .catch(reason => { if (active) setError(errorMessage(reason, 'No se pudo preparar el formulario.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    const form = new FormData(event.currentTarget)
    const images = form.getAll('images').filter((value): value is File =>
      value instanceof File && Boolean(value.name || value.size))
    const validation = validateProduct({
      name: String(form.get('name') ?? ''),
      description: String(form.get('description') ?? ''),
      categoryId: String(form.get('categoryId') ?? ''),
      city: String(form.get('city') ?? ''),
      price: String(form.get('price') ?? ''),
      characteristicIds: form.getAll('characteristicIds').map(String),
      houseRules: String(form.get('houseRules') ?? ''),
      healthAndSafety: String(form.get('healthAndSafety') ?? ''),
      cancellationPolicy: String(form.get('cancellationPolicy') ?? ''),
      images,
      requireImages: !editing,
    })
    setError('')
    setFieldErrors(validation.errors)
    if (!validation.valid) return

    form.set('name', validation.values.name)
    form.set('description', validation.values.description)
    form.set('categoryId', validation.values.categoryId)
    form.set('city', validation.values.city)
    form.set('price', validation.values.price)
    form.set('houseRules', validation.values.houseRules)
    form.set('healthAndSafety', validation.values.healthAndSafety)
    form.set('cancellationPolicy', validation.values.cancellationPolicy)
    form.delete('characteristicIds')
    validation.values.characteristicIds.forEach(value => form.append('characteristicIds', value))
    form.delete('images')
    validation.values.images.forEach(file => form.append('images', file))

    submitting.current = true
    setSaving(true)
    try {
      if (editing && id) await productsApi.update(id, form)
      else await productsApi.create(form)
      navigate('/administracion/productos')
    } catch (reason) {
      if (isApiError(reason)) setFieldErrors(reason.fieldErrors)
      setError(errorMessage(reason, 'No se pudo guardar.'))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  if (loading) return <Layout><StatusMessage>Cargando formulario…</StatusMessage></Layout>

  return <Layout><section className="admin-page">
    <Link to="/administracion/productos" className="text-link">← Lista de productos</Link>
    <p className="kicker">{editing ? 'EDITAR ESTADÍA' : 'NUEVA ESTADÍA'}</p>
    <h1>{editing ? 'Editar producto' : 'Agregar producto'}</h1>
    {error && !categories.length ? <StatusMessage kind="error">{error}</StatusMessage> : <form onSubmit={submit} className="product-form" noValidate aria-busy={saving}>
      <label>Nombre
        <input name="name" required maxLength={120} defaultValue={product?.name} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'name')} />
        <FieldError errors={fieldErrors} name="name" />
      </label>
      <label>Categoría
        <select name="categoryId" required defaultValue={product?.categoryId ?? ''} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'categoryId')}>
          <option value="" disabled>Elegí una categoría</option>
          {categories.map(category => <option value={category.id} key={category.id}>{category.title}</option>)}
        </select>
        <FieldError errors={fieldErrors} name="categoryId" />
      </label>
      <label>Ciudad
        <input name="city" required maxLength={100} defaultValue={product?.city} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'city')} />
        <FieldError errors={fieldErrors} name="city" />
      </label>
      <label>Precio por noche (ARS)
        <input name="price" required type="number" min="0.01" step="0.01" defaultValue={product?.price} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'price')} />
        <FieldError errors={fieldErrors} name="price" />
      </label>
      <label className="full">Descripción
        <textarea name="description" required maxLength={1200} rows={5} defaultValue={product?.description} disabled={saving} {...fieldErrorAttributes(fieldErrors, 'description')} />
        <FieldError errors={fieldErrors} name="description" />
      </label>
      <fieldset className="full policy-fields" disabled={saving}>
        <legend>Políticas del alojamiento</legend>
        <label>Normas de la casa
          <textarea name="houseRules" required maxLength={1200} rows={4} defaultValue={policy('Normas de la casa')} {...fieldErrorAttributes(fieldErrors, 'houseRules')} />
          <FieldError errors={fieldErrors} name="houseRules" />
        </label>
        <label>Salud y seguridad
          <textarea name="healthAndSafety" required maxLength={1200} rows={4} defaultValue={policy('Salud y seguridad')} {...fieldErrorAttributes(fieldErrors, 'healthAndSafety')} />
          <FieldError errors={fieldErrors} name="healthAndSafety" />
        </label>
        <label>Política de cancelación
          <textarea name="cancellationPolicy" required maxLength={1200} rows={4} defaultValue={policy('Política de cancelación')} {...fieldErrorAttributes(fieldErrors, 'cancellationPolicy')} />
          <FieldError errors={fieldErrors} name="cancellationPolicy" />
        </label>
      </fieldset>
      <fieldset className="full checkbox-field" disabled={saving} {...fieldErrorAttributes(fieldErrors, 'characteristicIds')}>
        <legend>Características (elegí una o más)</legend>
        {characteristics.map(item => <label key={item.id}>
          <input type="checkbox" name="characteristicIds" value={item.id} defaultChecked={product?.characteristics.some(value => value.id === item.id)} />
          <span>{item.icon} {item.name}</span>
        </label>)}
        <FieldError errors={fieldErrors} name="characteristicIds" />
      </fieldset>
      <label className="full upload-label">Imágenes
        <input name="images" required={!editing} type="file" accept="image/*" multiple disabled={saving} {...fieldErrorAttributes(fieldErrors, 'images')} />
        <span>{editing ? 'Dejalas sin seleccionar para conservar las imágenes actuales.' : 'Subí una o más imágenes (máx. 5 MB por archivo).'}</span>
        <FieldError errors={fieldErrors} name="images" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <Link to="/administracion/productos" className="ghost dark" aria-disabled={saving} onClick={event => { if (saving) event.preventDefault() }}>Cancelar</Link>
        <button className="primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button>
      </div>
    </form>}
  </section></Layout>
}
