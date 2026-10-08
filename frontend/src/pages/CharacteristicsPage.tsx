import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { characteristicsApi } from '../api'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { Characteristic } from '../types'
import { errorMessage } from '../utils/product'

export function CharacteristicsPage() {
  const [items, setItems] = useState<Characteristic[]>([]); const [editing, setEditing] = useState<Characteristic | null>(null); const [error, setError] = useState('')
  const load = useCallback(async () => { try { setItems(await characteristicsApi.list()) } catch (reason) { setError(errorMessage(reason, 'No se pudieron cargar las características.')) } }, [])
  useEffect(() => { void load() }, [load])
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const data = { name: String(form.get('name')), icon: String(form.get('icon')) }; try { editing ? await characteristicsApi.update(editing.id, data) : await characteristicsApi.create(data); setEditing(null); element.reset(); await load() } catch (reason) { setError(errorMessage(reason, 'No se pudo guardar.')) } }
  async function remove(item: Characteristic) { if (!confirm(`¿Eliminar “${item.name}”?`)) return; try { await characteristicsApi.remove(item.id); await load() } catch (reason) { setError(errorMessage(reason, 'No se pudo eliminar.')) } }
  return <Layout><section className="admin-page wide"><Link to="/administracion" className="text-link">← Administración</Link><p className="kicker">SERVICIOS DEL ALOJAMIENTO</p><h1>Características</h1><div className="management-grid"><form onSubmit={submit} className="stack-form"><h2>{editing ? 'Editar característica' : 'Nueva característica'}</h2><label>Nombre<input name="name" required maxLength={60} defaultValue={editing?.name} key={`name-${editing?.id}`} /></label><label>Ícono o emoji<input name="icon" required maxLength={24} defaultValue={editing?.icon} key={`icon-${editing?.id}`} /></label><button className="primary">{editing ? 'Guardar cambios' : 'Agregar característica'}</button>{editing && <button type="button" className="ghost" onClick={() => setEditing(null)}>Cancelar edición</button>}</form><div>{error && <StatusMessage kind="error">{error}</StatusMessage>}<div className="feature-admin-list">{items.map(item => <article key={item.id}><span>{item.icon}</span><b>{item.name}</b><button className="text-button" onClick={() => setEditing(item)}>Editar</button><button className="delete" onClick={() => remove(item)}>Eliminar</button></article>)}</div></div></div></section></Layout>
}
