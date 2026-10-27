import { createContext, useContext, useEffect, useState } from 'react'
import { favoritesApi } from './api'
import { useAuth } from './auth'
import type { Product } from './types'
import { errorMessage } from './utils/product'

type FavoritesValue = {
  items: Product[]
  loading: boolean
  error: string
  isFavorite: (productId: number) => boolean
  isPending: (productId: number) => boolean
  toggle: (product: Product) => Promise<void>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingIds, setPendingIds] = useState<Set<number>>(() => new Set())

  async function refresh() {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    setError('')
    try {
      setItems(await favoritesApi.list())
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudieron cargar tus favoritos.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (!user) {
      setItems([])
      setPendingIds(new Set())
      setError('')
      return () => { active = false }
    }
    setLoading(true)
    setError('')
    favoritesApi.list()
      .then(next => { if (active) setItems(next) })
      .catch(reason => { if (active) setError(errorMessage(reason, 'No se pudieron cargar tus favoritos.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  async function toggle(product: Product) {
    if (!user || pendingIds.has(product.id)) return
    const wasFavorite = items.some(item => item.id === product.id)
    setError('')
    setPendingIds(current => new Set(current).add(product.id))
    setItems(current => wasFavorite ? current.filter(item => item.id !== product.id) : [...current, product])
    try {
      if (wasFavorite) await favoritesApi.remove(product.id)
      else {
        const saved = await favoritesApi.add(product.id)
        setItems(current => current.map(item => item.id === saved.id ? saved : item))
      }
    } catch (reason) {
      setItems(current => wasFavorite
        ? (current.some(item => item.id === product.id) ? current : [...current, product])
        : current.filter(item => item.id !== product.id))
      setError(errorMessage(reason, 'No se pudo actualizar el favorito.'))
    } finally {
      setPendingIds(current => {
        const next = new Set(current)
        next.delete(product.id)
        return next
      })
    }
  }

  return <FavoritesContext.Provider value={{
    items,
    loading,
    error,
    isFavorite: productId => items.some(item => item.id === productId),
    isPending: productId => pendingIds.has(productId),
    toggle,
    refresh,
  }}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('FavoritesProvider no está configurado.')
  return value
}
