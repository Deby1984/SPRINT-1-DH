import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Pagination } from '../components/products/Pagination'
import { StatusMessage } from '../components/StatusMessage'
import { productsApi } from '../api'
import type { Product, ProductPage } from '../types'
import { errorMessage } from '../utils/product'

export function ProductListPage() {
  const operationLock = useRef(false)
  const [data, setData] = useState<ProductPage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [removing, setRemoving] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await productsApi.list(page))
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudo cargar el catálogo.'))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { void load() }, [load])

  async function remove(product: Product) {
    if (operationLock.current) return
    if (!window.confirm(`¿Eliminar “${product.name}”? Esta acción no se puede deshacer.`)) return
    operationLock.current = true
    setRemoving(product.id)
    setError('')
    try {
      await productsApi.remove(product.id)
      if (data?.content.length === 1 && page > 0) setPage(current => current - 1)
      else await load()
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudo eliminar.'))
    } finally {
      operationLock.current = false
      setRemoving(null)
    }
  }

  const busy = removing !== null

  return <Layout><section className="admin-page wide" aria-busy={busy}>
    <Link to="/administracion" className="text-link">← Administración</Link>
    <div className="table-heading"><div><p className="kicker">CATÁLOGO</p><h1>Lista de productos</h1></div>
      <Link to="/administracion/productos/nuevo" className="primary" aria-disabled={busy} onClick={event => { if (busy) event.preventDefault() }}>+ Agregar producto</Link>
    </div>
    {loading ? <StatusMessage>Cargando catálogo…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage> : !data || data.content.length === 0 ? <StatusMessage kind="empty">Todavía no hay productos registrados.</StatusMessage> : <>
      <div className="table-wrap"><table><thead><tr><th>Id</th><th>Nombre</th><th>Categoría</th><th>Acciones</th></tr></thead><tbody>{data.content.map(product => <tr key={product.id}>
        <td>#{product.id}</td><td><Link to={`/productos/${product.id}`}>{product.name}</Link></td><td>{product.category}</td>
        <td className="actions-cell">
          <Link className="text-button" to={`/administracion/productos/${product.id}/editar`} aria-disabled={busy} onClick={event => { if (busy) event.preventDefault() }}>Editar</Link>
          <button className="delete" onClick={() => remove(product)} disabled={busy}>{removing === product.id ? 'Eliminando…' : 'Eliminar'}</button>
        </td>
      </tr>)}</tbody></table></div>
      <Pagination page={data.number} total={data.totalPages} onPage={nextPage => { if (!busy) setPage(nextPage) }} />
    </>}
  </section></Layout>
}
