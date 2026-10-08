import { Route, Routes } from 'react-router-dom'
import { AdminPage } from './pages/AdminPage'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProductListPage } from './pages/ProductListPage'

export default function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/productos/:id" element={<DetailPage />} /><Route path="/administracion" element={<AdminPage />} /><Route path="/administracion/productos/nuevo" element={<ProductFormPage />} /><Route path="/administracion/productos" element={<ProductListPage />} /><Route path="*" element={<HomePage />} /></Routes>
}
