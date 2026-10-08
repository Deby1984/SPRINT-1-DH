import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'

export function AdminPage() {
  return <Layout><section className="admin"><div className="admin-intro"><p className="kicker">ESPACIO DE GESTIÓN</p><h1>Administración</h1><p>Gestioná el catálogo, las categorías, las características y los permisos de Horizonte.</p></div><div className="admin-menu"><Link to="/administracion/productos/nuevo" className="primary">+ Agregar producto</Link><Link to="/administracion/productos" className="outline dark">Lista de productos</Link><Link to="/administracion/categorias" className="outline dark">Categorías</Link><Link to="/administracion/caracteristicas" className="outline dark">Características</Link><Link to="/administracion/usuarios" className="outline dark">Usuarios y roles</Link></div></section></Layout>
}
