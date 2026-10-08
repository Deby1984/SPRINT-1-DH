import { NavLink } from 'react-router-dom'
import { Brand } from './Brand'

export function Header() {
  return <header className="site-header"><Brand /><nav><NavLink to="/">Explorar</NavLink><NavLink to="/administracion">Administración</NavLink></nav><div className="header-actions"><button className="ghost" type="button">Crear cuenta</button><button className="outline" type="button">Iniciar sesión</button></div></header>
}
