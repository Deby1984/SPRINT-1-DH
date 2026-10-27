import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { useFavorites } from '../../favorites'
import type { Product } from '../../types'

export function FavoriteButton({ product }: { product: Product }) {
  const { user } = useAuth()
  const { isFavorite, isPending, toggle } = useFavorites()
  const location = useLocation()
  const navigate = useNavigate()
  const favorite = isFavorite(product.id)
  const pending = isPending(product.id)

  function click(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
      return
    }
    void toggle(product)
  }

  return <button
    type="button"
    className={`favorite-button ${favorite ? 'active' : ''}`}
    onClick={click}
    disabled={pending}
    aria-pressed={favorite}
    aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
    title={user ? (favorite ? 'Quitar de favoritos' : 'Agregar a favoritos') : 'Iniciá sesión para guardar favoritos'}
  >{favorite ? '♥' : '♡'}</button>
}
