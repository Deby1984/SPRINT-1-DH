import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { imageSource, money } from '../../utils/product'
import { FavoriteButton } from './FavoriteButton'
import { RatingBadge } from './RatingBadge'

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <FavoriteButton product={product} />
    <Link className="product-card-link" to={`/productos/${product.id}`}>
      <img src={imageSource(product.images[0])} alt={`Vista de ${product.name}`} />
      <div className="card-content">
        <div className="card-meta">
          <span className="eyebrow">{product.category} · {product.city}</span>
          <RatingBadge average={product.averageRating ?? 0} count={product.reviewCount ?? 0} />
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong>{money.format(product.price)} <small>/ noche</small></strong>
      </div>
    </Link>
  </article>
}
