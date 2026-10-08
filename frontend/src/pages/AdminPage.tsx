import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'

export function AdminPage() {
  return <Layout><section className="admin"><div className="admin-intro"><p className="kicker">ESPACIO DE GESTIÓN</p><h1>Administración</h1><p>Gestioná los alojamientos visibles en Horizonte.</p></div><div className="admin-menu"><Link to="/administracion/productos/nuevo" className="primary">+ Agregar producto</Link><Link to="/administracion/productos" className="outline dark">Lista de productos</Link></div></section><div className="admin-mobile"><span>⌁</span><h2>Panel disponible sólo en desktop</h2><p>Para gestionar el catálogo, abrí esta página en una pantalla más amplia.</p></div></Layout>
}
