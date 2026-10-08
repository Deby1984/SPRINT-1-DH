import { NavLink } from 'react-router-dom'
import { Brand } from './Brand'
import { useAuth } from '../../auth'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : ''
  async function signOut() { await logout(); navigate('/') }
  return <header className="site-header"><Brand /><nav><NavLink to="/">Explorar</NavLink>{user?.role === 'ADMIN' && <NavLink to="/administracion">Administración</NavLink>}</nav><div className="header-actions">{user ? <div className="user-menu"><span className="avatar">{initials}</span><div><b>{user.firstName}</b><button type="button" onClick={signOut}>Cerrar sesión</button></div></div> : <><NavLink className="ghost" to="/registro">Crear cuenta</NavLink><NavLink className="outline" to="/login">Iniciar sesión</NavLink></>}</div></header>
}
