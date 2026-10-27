/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../types'
import { flushReact, renderReact } from '../test/reactTestUtils'

const mocks = vi.hoisted(() => ({
  listCategories: vi.fn(),
  filterProducts: vi.fn(),
  searchProducts: vi.fn(),
}))

vi.mock('../api', () => ({
  categoriesApi: { list: mocks.listCategories },
  productsApi: {
    filter: mocks.filterProducts,
    search: mocks.searchProducts,
  },
}))

vi.mock('../components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

vi.mock('../components/products/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => <article data-product={product.id}>{product.name}</article>,
}))

vi.mock('../components/search/SearchBlock', () => ({
  SearchBlock: ({ searching, onSearch }: {
    searching: boolean
    onSearch: (criteria: { city: string; checkIn: string; checkOut: string }) => void
  }) => <section>
    <output data-testid="searching">{String(searching)}</output>
    <button type="button" onClick={() => onSearch({ city: 'Bariloche', checkIn: '2026-11-10', checkOut: '2026-11-12' })}>Buscar Bariloche</button>
  </section>,
}))

import { HomePage } from './HomePage'

const recommendation: Product = {
  id: 2,
  name: 'Loft Puerto',
  description: 'Frente al río.',
  categoryId: 2,
  category: 'Lofts',
  city: 'Buenos Aires',
  price: 118000,
  images: [],
  characteristics: [],
  policies: [],
  averageRating: 4.5,
  reviewCount: 2,
}
const result: Product = { ...recommendation, id: 1, name: 'Casa Bruma', category: 'Cabañas', city: 'Bariloche' }
const cleanups: Array<() => Promise<void>> = []

beforeEach(() => {
  mocks.listCategories.mockReset().mockResolvedValue([{
    id: 1,
    title: 'Cabañas',
    description: 'Refugios entre montañas.',
    imageUrl: 'https://example.com/cabanas.jpg',
  }])
  mocks.filterProducts.mockReset().mockResolvedValue({ products: [recommendation], filteredCount: 1, totalCount: 1 })
  mocks.searchProducts.mockReset().mockResolvedValue([result])
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

describe('HomePage', () => {
  it('mantiene categorías y recomendaciones al presentar resultados de búsqueda', async () => {
    const view = await renderReact(<HomePage />)
    cleanups.push(view.cleanup)
    await flushReact()

    await act(async () => {
      [...view.container.querySelectorAll('button')].find(button => button.textContent === 'Buscar Bariloche')?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(view.container.textContent).toContain('¿Cómo querés viajar?')
    expect(view.container.textContent).toContain('Estadías disponibles en Bariloche')
    expect(view.container.textContent).toContain('Casa Bruma')
    expect(view.container.textContent).toContain('Estadías para inspirarte')
    expect(view.container.textContent).toContain('Loft Puerto')
  })

  it('no bloquea el buscador cuando solo están cargando las recomendaciones', async () => {
    mocks.filterProducts.mockReturnValue(new Promise(() => {}))
    const view = await renderReact(<HomePage />)
    cleanups.push(view.cleanup)

    expect(view.container.querySelector('[data-testid="searching"]')?.textContent).toBe('false')
  })
})
