import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { imageSource, money } from '../../utils/product'

export function ProductCard({ product }: { product: Product }) {
  return <Link className="product-card" to={`/productos/${product.id}`}><img src={imageSource(product.images[0])} alt={`Vista de ${product.name}`} /><div className="card-content"><div className="eyebrow">{product.category} · {product.city}</div><h3>{product.name}</h3><p>{product.description}</p><strong>{money.format(product.price)} <small>/ noche</small></strong></div></Link>
}
