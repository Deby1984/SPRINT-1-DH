import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { StatusMessage } from '../components/StatusMessage'
import { useFavorites } from '../favorites'

export function FavoritesPage() {
  const { items, loading, error, refresh } = useFavorites()

  return <Layout><section className="favorites-page">
    <div className="section-heading spread">
      <div><p className="kicker">TU SELECCIÓN</p><h1>Productos favoritos</h1></div>
      <span className="result-count">{items.length} guardados</span>
    </div>
    {loading
      ? <StatusMessage>Cargando favoritos…</StatusMessage>
      : error
        ? <div className="inline-state"><StatusMessage kind="error">{error}</StatusMessage><button className="outline" type="button" onClick={() => void refresh()}>Intentar nuevamente</button></div>
        : items.length === 0
          ? <StatusMessage kind="empty">Todavía no guardaste ningún alojamiento. Usá el corazón de las tarjetas para agregarlo.</StatusMessage>
          : <div className="product-grid">{items.map(product => <ProductCard key={product.id} product={product} />)}</div>}
  </section></Layout>
}
