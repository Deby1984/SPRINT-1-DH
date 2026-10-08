import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { StatusMessage } from '../components/StatusMessage'
import { productsApi } from '../api'
import type { Product } from '../types'
import { errorMessage, imageSource, money } from '../utils/product'

export function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [gallery, setGallery] = useState(false)
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

  if (loading) return <Layout><StatusMessage>Cargando alojamiento…</StatusMessage></Layout>
  if (error) return <Layout><div className="page-state"><StatusMessage kind="error">{error}</StatusMessage><button onClick={() => navigate('/')} className="outline" type="button">Volver al inicio</button></div></Layout>
  if (!product) return <Layout><StatusMessage kind="empty">No encontramos el alojamiento solicitado.</StatusMessage></Layout>

  const images = product.images.slice(0, 5)
  return <Layout><section className="detail-title"><div><p className="kicker">{product.category} · {product.city}</p><h1>{product.name}</h1></div><button onClick={() => navigate(-1)} className="back" type="button">← Volver</button></section><section className="detail-content"><div className="gallery"><img className="gallery-main" src={imageSource(images[0])} alt={`Vista principal de ${product.name}`} /><div className="gallery-side">{images.slice(1, 5).map((image, index) => <img src={imageSource(image)} alt={`Vista ${index + 2} de ${product.name}`} key={image} />)}</div><button onClick={() => setGallery(true)} className="view-more" type="button">Ver más fotos ↗</button></div><article className="description"><p className="kicker">SOBRE LA ESTADÍA</p><h2>Un lugar para bajar el ritmo.</h2><p>{product.description}</p><section className="features"><p className="kicker">CARACTERÍSTICAS</p><h2>Todo lo que incluye.</h2><div>{product.characteristics.map(item => <span key={item.id}><b>{item.icon}</b>{item.name}</span>)}</div></section><div className="booking-box"><span>Desde</span><strong>{money.format(product.price)} <small>/ noche</small></strong><button className="primary" type="button">Consultar disponibilidad</button></div></article></section>{gallery && <div className="lightbox" role="dialog" aria-modal="true"><button onClick={() => setGallery(false)} className="close" type="button" aria-label="Cerrar galería">×</button><div>{product.images.map((image, index) => <img src={imageSource(image)} alt={`Galería ${index + 1} de ${product.name}`} key={image} />)}</div></div>}</Layout>
}
