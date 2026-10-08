import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../api'
import { useAuth } from '../auth'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import type { User } from '../types'
import { errorMessage } from '../utils/product'

export function UsersPage() {
  const { user } = useAuth(); const [items, setItems] = useState<User[]>([]); const [error, setError] = useState('')
  const load = useCallback(async () => { try { setItems(await usersApi.list()) } catch (reason) { setError(errorMessage(reason, 'No se pudieron cargar los usuarios.')) } }, [])
  useEffect(() => { void load() }, [load])
  async function change(item: User, role: User['role']) { try { await usersApi.changeRole(item.id, role); await load() } catch (reason) { setError(errorMessage(reason, 'No se pudo modificar el rol.')) } }
  return <Layout><section className="admin-page wide"><Link to="/administracion" className="text-link">← Administración</Link><p className="kicker">PERMISOS</p><h1>Usuarios y roles</h1>{error && <StatusMessage kind="error">{error}</StatusMessage>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{item.firstName} {item.lastName}</td><td>{item.email}</td><td><select value={item.role} disabled={item.id === user?.id} onChange={event => change(item, event.target.value as User['role'])}><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select></td></tr>)}</tbody></table></div></section></Layout>
}
