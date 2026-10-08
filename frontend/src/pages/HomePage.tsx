import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { StatusMessage } from '../components/StatusMessage'
import { productsApi } from '../api'
import type { Product } from '../types'
import { errorMessage } from '../utils/product'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    productsApi.random()
      .then(data => { if (active) setProducts(data) })
      .catch(reason => { if (active) setError(errorMessage(reason, 'No se pudieron cargar las recomendaciones.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const categories = ['Cabañas', 'Casas', 'Hoteles', 'Estancias']

  return <Layout><section className="hero"><div><p className="kicker">RESERVAS CON ALMA</p><h1>Encontrá un lugar que se sienta como tuyo.</h1><p className="hero-copy">Estancias singulares para descansar, descubrir y volver a conectar.</p><a href="#recomendadas" className="primary">Explorar alojamientos <span>→</span></a></div><div className="hero-card"><span>◆</span><b>11 destinos</b><small>seleccionados con cuidado</small></div></section><section className="category-section"><div className="section-heading"><p className="kicker">ELEGÍ TU RITMO</p><h2>¿Cómo querés viajar?</h2></div><div className="categories">{categories.map((category, index) => <div className={`category category-${index}`} key={category}><span>{['⌂', '◌', '⌁', '✦'][index]}</span><b>{category}</b><small>Descubrir estadías</small></div>)}</div></section><section id="recomendadas" className="recommendations"><div className="section-heading spread"><div><p className="kicker">SELECCIÓN DEL DÍA</p><h2>Estadías para inspirarte</h2></div><span className="result-count">Hasta 10 recomendaciones aleatorias</span></div>{loading ? <StatusMessage>Buscando lugares especiales…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage> : products.length === 0 ? <StatusMessage kind="empty">Todavía no hay alojamientos disponibles.</StatusMessage> : <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>}</section></Layout>
}
