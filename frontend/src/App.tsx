import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { StatusMessage } from './components/StatusMessage'
import { Layout } from './components/layout/Layout'
import { AdminPage } from './pages/AdminPage'
import { AuthPage } from './pages/AuthPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CharacteristicsPage } from './pages/CharacteristicsPage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProductListPage } from './pages/ProductListPage'
import { UsersPage } from './pages/UsersPage'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Layout><StatusMessage>Verificando sesión…</StatusMessage></Layout>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const admin = (element: React.ReactNode) => <AdminRoute>{element}</AdminRoute>
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/productos/:id" element={<DetailPage />} />
    <Route path="/registro" element={<AuthPage mode="register" />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/administracion" element={admin(<AdminPage />)} />
    <Route path="/administracion/productos/nuevo" element={admin(<ProductFormPage />)} />
    <Route path="/administracion/productos/:id/editar" element={admin(<ProductFormPage />)} />
    <Route path="/administracion/productos" element={admin(<ProductListPage />)} />
    <Route path="/administracion/categorias" element={admin(<CategoriesPage />)} />
    <Route path="/administracion/caracteristicas" element={admin(<CharacteristicsPage />)} />
    <Route path="/administracion/usuarios" element={admin(<UsersPage />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
