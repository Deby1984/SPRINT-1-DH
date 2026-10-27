import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import { AvailabilitySection } from '../components/detail/AvailabilitySection'
import { ProductPolicies } from '../components/detail/ProductPolicies'
import { ReviewsSection } from '../components/detail/ReviewsSection'
import { ShareModal } from '../components/detail/ShareModal'
import { FavoriteButton } from '../components/products/FavoriteButton'
import { RatingBadge } from '../components/products/RatingBadge'
import { productsApi } from '../api'
import type { Product, ReviewSummary } from '../types'
import { errorMessage, imageSource, money } from '../utils/product'
import { productShareMetadata } from '../utils/share'

type MetaSnapshot = { element: HTMLMetaElement; created: boolean; content: string | null }

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): MetaSnapshot {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  const created = !element
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  const snapshot = { element, created, content: element.getAttribute('content') }
  element.setAttribute('content', content)
  return snapshot
}

export function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [gallery, setGallery] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setProduct(null)

    if (!id) {
      setError('El producto solicitado no es válido.')
      setLoading(false)
      return () => { active = false }
    }

    productsApi.get(id)
      .then(data => { if (active) setProduct(data) })
      .catch(reason => { if (active) setError(errorMessage(reason, 'No se pudo cargar el alojamiento.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (!product) return
    const previousTitle = document.title
    const metadata = productShareMetadata(
      product.name,
      product.description,
      imageSource(product.images[0]),
      window.location.href,
    )
    document.title = metadata.title
    const snapshots = [
      setMeta('meta[name="description"]', 'name', 'description', metadata.description),
      setMeta('meta[property="og:type"]', 'property', 'og:type', 'website'),
      setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title),
      setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description),
      setMeta('meta[property="og:image"]', 'property', 'og:image', metadata.image),
      setMeta('meta[property="og:url"]', 'property', 'og:url', metadata.url),
      setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image'),
      setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title),
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description),
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', metadata.image),
    ]

    return () => {
      document.title = previousTitle
      snapshots.forEach(({ element, created, content }) => {
        if (created) element.remove()
        else if (content === null) element.removeAttribute('content')
        else element.setAttribute('content', content)
      })
    }
  }, [product])

  const updateRating = useCallback((summary: ReviewSummary) => {
    setProduct(current => current ? {
      ...current,
      averageRating: summary.averageRating,
      reviewCount: summary.reviewCount,
    } : current)
  }, [])

  if (loading) return <Layout><StatusMessage>Cargando alojamiento…</StatusMessage></Layout>
  if (error) return <Layout><div className="page-state"><StatusMessage kind="error">{error}</StatusMessage><button onClick={() => navigate('/')} className="outline" type="button">Volver al inicio</button></div></Layout>
  if (!product) return <Layout><StatusMessage kind="empty">No encontramos el alojamiento solicitado.</StatusMessage></Layout>

  const images = product.images.length > 0 ? product.images.slice(0, 5) : ['']
  const secondaryImages = images.slice(1)
  const hasMultipleImages = product.images.length > 1

  return <Layout>
    <section className="detail-title">
      <div><p className="kicker">{product.category} · {product.city}</p><h1>{product.name}</h1><RatingBadge average={product.averageRating ?? 0} count={product.reviewCount ?? 0} /></div>
      <div className="detail-actions">
        <FavoriteButton product={product} />
        <button className="back" type="button" onClick={() => setSharing(true)}>Compartir</button>
        <button onClick={() => navigate(-1)} className="back" type="button">← Volver</button>
      </div>
    </section>
    <section className="detail-content">
      <div className={`gallery gallery-${images.length}`}>
        <img className="gallery-main" src={imageSource(images[0])} alt={`Vista principal de ${product.name}`} />
        {secondaryImages.length > 0 && <div className={`gallery-side gallery-side-${secondaryImages.length}`}>{secondaryImages.map((image, index) => <img src={imageSource(image)} alt={`Vista ${index + 2} de ${product.name}`} key={`${image}-${index}`} />)}</div>}
        {hasMultipleImages && <button onClick={() => setGallery(true)} className="view-more" type="button">Ver más fotos ↗</button>}
      </div>
      <article className="description">
        <p className="kicker">SOBRE LA ESTADÍA</p><h2>Un lugar para bajar el ritmo.</h2><p>{product.description}</p>
        <section className="features"><p className="kicker">CARACTERÍSTICAS</p><h2>Todo lo que incluye.</h2><div>{product.characteristics.map(item => <span key={item.id}><b>{item.icon}</b>{item.name}</span>)}</div></section>
        <div className="booking-box"><span>Desde</span><strong>{money.format(product.price)} <small>/ noche</small></strong><button className="primary" type="button" onClick={() => document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth' })}>Consultar disponibilidad</button></div>
      </article>
      <AvailabilitySection product={product} />
      <ProductPolicies policies={product.policies} />
      <ReviewsSection productId={product.id} onSummaryChange={updateRating} />
    </section>
    {gallery && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${product.name}`}><button onClick={() => setGallery(false)} className="close" type="button" aria-label="Cerrar galería">×</button><div>{product.images.map((image, index) => <img src={imageSource(image)} alt={`Galería ${index + 1} de ${product.name}`} key={`${image}-${index}`} />)}</div></div>}
    {sharing && <ShareModal product={product} onClose={() => setSharing(false)} />}
  </Layout>
}
