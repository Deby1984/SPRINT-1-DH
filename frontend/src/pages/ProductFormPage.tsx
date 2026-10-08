import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { productsApi } from '../api'
import { errorMessage } from '../utils/product'

export function ProductFormPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const form = new FormData(event.currentTarget)
      await productsApi.create(form)
      navigate('/administracion/productos')
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudo guardar.'))
    } finally {
      setSaving(false)
    }
  }

  return <Layout><section className="admin-page"><Link to="/administracion" className="text-link">← Administración</Link><p className="kicker">NUEVA ESTADÍA</p><h1>Agregar producto</h1><form onSubmit={submit} className="product-form"><label>Nombre<input name="name" required maxLength={120} placeholder="Ej. Casa Bruma" /></label><label>Categoría<select name="category" required defaultValue=""><option value="" disabled>Elegí una categoría</option><option>Cabañas</option><option>Casas</option><option>Hoteles</option><option>Departamentos</option><option>Estancias</option></select></label><label>Ciudad<input name="city" required placeholder="Ej. Bariloche" /></label><label>Precio por noche (ARS)<input name="price" required type="number" min="1" step="1" placeholder="120000" /></label><label className="full">Descripción<textarea name="description" required maxLength={1200} placeholder="Contá qué hace especial a esta estadía." rows={5} /></label><label className="full upload-label">Imágenes<input name="images" required type="file" accept="image/*" multiple /><span>Podés subir una o más imágenes (máx. 5 MB por archivo).</span></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link to="/administracion" className="ghost dark">Cancelar</Link><button className="primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button></div></form></section></Layout>
}
