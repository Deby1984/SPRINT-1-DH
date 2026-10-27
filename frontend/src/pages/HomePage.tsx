import { useEffect, useState } from 'react'
import { categoriesApi, productsApi } from '../api'
import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { SearchBlock, type SearchCriteria } from '../components/search/SearchBlock'
import { StatusMessage } from '../components/StatusMessage'
import type { Category, Product } from '../types'
import { errorMessage } from '../utils/product'

export function HomePage() {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [results, setResults] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState<SearchCriteria | null>(null)
  const [total, setTotal] = useState(0)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState('')
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let active = true
    setRecommendationsLoading(true)
    setRecommendationsError('')
    productsApi.filter(selected)
      .then(recommended => {
        if (!active) return
        setRecommendations(recommended.products)
        setTotal(recommended.totalCount)
      })
      .catch(reason => {
        if (active) setRecommendationsError(errorMessage(reason, 'No se pudieron cargar las recomendaciones.'))
      })
      .finally(() => {
        if (active) setRecommendationsLoading(false)
      })
    return () => { active = false }
  }, [selected])

  useEffect(() => {
    if (!search) {
      setResults([])
      setSearchError('')
      setSearchLoading(false)
      return
    }
    let active = true
    setSearchLoading(true)
    setSearchError('')
    productsApi.search({ ...search, categoryIds: selected })
      .then(found => { if (active) setResults(found) })
      .catch(reason => { if (active) setSearchError(errorMessage(reason, 'No se pudo realizar la búsqueda.')) })
      .finally(() => { if (active) setSearchLoading(false) })
    return () => { active = false }
  }, [search, selected])

  function toggle(id: number) {
    setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  }

  return <Layout>
    <SearchBlock searching={searchLoading} active={search !== null} onSearch={setSearch} onClear={() => setSearch(null)} />

    <section className="category-section">
      <div className="section-heading spread">
        <div><p className="kicker">FILTRÁ POR CATEGORÍA</p><h2>¿Cómo querés viajar?</h2></div>
        {selected.length > 0 && <button className="text-button" onClick={() => setSelected([])}>Limpiar filtros</button>}
      </div>
      <div className="categories dynamic">
        {categories.map(category => <button
          className={`category ${selected.includes(category.id) ? 'selected' : ''}`}
          key={category.id}
          onClick={() => toggle(category.id)}
          aria-pressed={selected.includes(category.id)}
        >
          <img src={category.imageUrl} alt="" />
          <span><b>{category.title}</b><small>{category.description}</small></span>
        </button>)}
      </div>
    </section>

    {search && <section id="resultados" className="recommendations search-results">
      <div className="section-heading spread">
        <div>
          <p className="kicker">RESULTADOS DE BÚSQUEDA</p>
          <h2>{`Estadías disponibles en ${search.city}`}</h2>
        </div>
        <span className="result-count">{results.length} alojamientos</span>
      </div>
      {searchLoading
        ? <StatusMessage>Buscando lugares especiales…</StatusMessage>
        : searchError
          ? <StatusMessage kind="error">{searchError}</StatusMessage>
          : results.length === 0
            ? <StatusMessage kind="empty">No encontramos alojamientos para esos criterios. Probá con otras fechas o filtros.</StatusMessage>
            : <div className="product-grid">{results.map(product => <ProductCard key={product.id} product={product} />)}</div>}
    </section>}

    <section id={search ? undefined : 'resultados'} className={`recommendations ${search ? 'preserved-recommendations' : ''}`}>
      <div className="section-heading spread">
        <div><p className="kicker">RECOMENDACIONES</p><h2>Estadías para inspirarte</h2></div>
        <span className="result-count">{recommendations.length} de {total} alojamientos</span>
      </div>
      {recommendationsLoading
        ? <StatusMessage>Cargando recomendaciones…</StatusMessage>
        : recommendationsError
          ? <StatusMessage kind="error">{recommendationsError}</StatusMessage>
          : recommendations.length === 0
            ? <StatusMessage kind="empty">No hay recomendaciones para las categorías seleccionadas.</StatusMessage>
            : <div className="product-grid">{recommendations.map(product => <ProductCard key={product.id} product={product} />)}</div>}
    </section>
  </Layout>
}
