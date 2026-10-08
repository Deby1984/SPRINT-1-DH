import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { StatusMessage } from '../components/StatusMessage'
import { categoriesApi, productsApi } from '../api'
import type { Category, Product } from '../types'
import { errorMessage } from '../utils/product'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [selected, setSelected] = useState<number[]>([])
  const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { categoriesApi.list().then(setCategories).catch(() => setCategories([])) }, [])
  useEffect(() => { let active = true; setLoading(true); setError(''); productsApi.filter(selected).then(data => { if (active) { setProducts(data.products); setTotal(data.totalCount) } }).catch(reason => { if (active) setError(errorMessage(reason, 'No se pudieron cargar los alojamientos.')) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [selected])
  function toggle(id: number) { setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]) }
  return <Layout><section className="hero"><div><p className="kicker">RESERVAS CON ALMA</p><h1>Encontrá un lugar que se sienta como tuyo.</h1><p className="hero-copy">Estancias singulares para descansar, descubrir y volver a conectar.</p><a href="#resultados" className="primary">Explorar alojamientos <span>→</span></a></div><div className="hero-card"><span>◆</span><b>{total} destinos</b><small>seleccionados con cuidado</small></div></section><section className="category-section"><div className="section-heading spread"><div><p className="kicker">FILTRÁ POR CATEGORÍA</p><h2>¿Cómo querés viajar?</h2></div>{selected.length > 0 && <button className="text-button" onClick={() => setSelected([])}>Limpiar filtros</button>}</div><div className="categories dynamic">{categories.map(category => <button className={`category ${selected.includes(category.id) ? 'selected' : ''}`} key={category.id} onClick={() => toggle(category.id)}><img src={category.imageUrl} alt="" /><span><b>{category.title}</b><small>{category.description}</small></span></button>)}</div></section><section id="resultados" className="recommendations"><div className="section-heading spread"><div><p className="kicker">RESULTADOS</p><h2>Estadías para inspirarte</h2></div><span className="result-count">{products.length} de {total} alojamientos</span></div>{loading ? <StatusMessage>Buscando lugares especiales…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage> : products.length === 0 ? <StatusMessage kind="empty">No hay alojamientos para los filtros elegidos.</StatusMessage> : <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>}</section></Layout>
}
