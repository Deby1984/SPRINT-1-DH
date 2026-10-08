import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriesApi } from '../api'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { Category } from '../types'
import { errorMessage } from '../utils/product'

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]); const [editing, setEditing] = useState<Category | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { try { setItems(await categoriesApi.list()) } catch (reason) { setError(errorMessage(reason, 'No se pudieron cargar las categorías.')) } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); const element = event.currentTarget; const form = new FormData(element); const data = { title: String(form.get('title')), description: String(form.get('description')), imageUrl: String(form.get('imageUrl')) }; try { if (editing) await categoriesApi.update(editing.id, data); else await categoriesApi.create(data); setEditing(null); element.reset(); await load() } catch (reason) { setError(errorMessage(reason, 'No se pudo guardar la categoría.')) } }
  async function remove(item: Category) { if (!confirm(`¿Eliminar la categoría “${item.title}”?`)) return; try { await categoriesApi.remove(item.id); await load() } catch (reason) { setError(errorMessage(reason, 'No se puede eliminar una categoría utilizada por productos.')) } }
  return <Layout><section className="admin-page wide"><Link to="/administracion" className="text-link">← Administración</Link><p className="kicker">ORGANIZACIÓN DEL CATÁLOGO</p><h1>Categorías</h1><div className="management-grid"><form onSubmit={submit} className="stack-form"><h2>{editing ? 'Editar categoría' : 'Nueva categoría'}</h2><label>Título<input name="title" required maxLength={60} defaultValue={editing?.title} key={`title-${editing?.id}`} /></label><label>Descripción<textarea name="description" required maxLength={500} rows={4} defaultValue={editing?.description} key={`description-${editing?.id}`} /></label><label>URL de imagen<input name="imageUrl" type="url" required maxLength={2048} defaultValue={editing?.imageUrl} key={`image-${editing?.id}`} /></label><button className="primary">{editing ? 'Guardar cambios' : 'Agregar categoría'}</button>{editing && <button type="button" className="ghost" onClick={() => setEditing(null)}>Cancelar edición</button>}</form><div>{error && <StatusMessage kind="error">{error}</StatusMessage>}{loading ? <StatusMessage>Cargando…</StatusMessage> : <div className="admin-cards">{items.map(item => <article key={item.id}><img src={item.imageUrl} alt="" /><div><h3>{item.title}</h3><p>{item.description}</p><button className="text-button" onClick={() => setEditing(item)}>Editar</button><button className="delete" onClick={() => remove(item)}>Eliminar</button></div></article>)}</div>}</div></div></section></Layout>
}
