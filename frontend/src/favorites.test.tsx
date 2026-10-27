/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from './types'
import { flushReact, renderReact } from './test/reactTestUtils'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  user: {
    id: 7,
    firstName: 'Ana',
    lastName: 'Paz',
    email: 'ana@example.com',
    role: 'USER' as const,
  },
}))

vi.mock('./api', () => ({
  favoritesApi: {
    list: mocks.list,
    add: mocks.add,
    remove: mocks.remove,
  },
}))

vi.mock('./auth', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

import { FavoritesProvider, useFavorites } from './favorites'

const product: Product = {
  id: 11,
  name: 'Tierra Clara',
  description: 'Una estancia tranquila.',
  categoryId: 4,
  category: 'Estancias',
  city: 'Tandil',
  price: 132000,
  images: ['https://example.com/tierra.jpg'],
  characteristics: [],
  policies: [],
  averageRating: 0,
  reviewCount: 0,
}

const cleanups: Array<() => Promise<void>> = []

function Probe() {
  const favorites = useFavorites()
  return <>
    <output data-testid="count">{favorites.items.length}</output>
    <output data-testid="favorite">{String(favorites.isFavorite(product.id))}</output>
    <output data-testid="pending">{String(favorites.isPending(product.id))}</output>
    <output data-testid="error">{favorites.error}</output>
    <button type="button" onClick={() => void favorites.toggle(product)}>Alternar</button>
  </>
}

function value(container: HTMLElement, testId: string) {
  return container.querySelector(`[data-testid="${testId}"]`)?.textContent
}

beforeEach(() => {
  mocks.list.mockReset().mockResolvedValue([])
  mocks.add.mockReset()
  mocks.remove.mockReset()
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

describe('FavoritesProvider', () => {
  it('agrega de forma optimista, bloquea el producto mientras guarda y conserva la respuesta final', async () => {
    let finish!: (saved: Product) => void
    mocks.add.mockReturnValue(new Promise<Product>(resolve => { finish = resolve }))
    const view = await renderReact(<FavoritesProvider><Probe /></FavoritesProvider>)
    cleanups.push(view.cleanup)
    await flushReact()

    await act(async () => view.container.querySelector('button')?.click())

    expect(value(view.container, 'count')).toBe('1')
    expect(value(view.container, 'favorite')).toBe('true')
    expect(value(view.container, 'pending')).toBe('true')
    expect(mocks.add).toHaveBeenCalledWith(product.id)

    await act(async () => {
      finish({ ...product, name: 'Tierra Clara actualizada' })
      await Promise.resolve()
    })

    expect(value(view.container, 'count')).toBe('1')
    expect(value(view.container, 'pending')).toBe('false')
    expect(value(view.container, 'error')).toBe('')
  })

  it('revierte el alta optimista y muestra un error cuando la API falla', async () => {
    mocks.add.mockRejectedValue(new Error('sin conexión'))
    const view = await renderReact(<FavoritesProvider><Probe /></FavoritesProvider>)
    cleanups.push(view.cleanup)
    await flushReact()

    await act(async () => {
      view.container.querySelector('button')?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(value(view.container, 'count')).toBe('0')
    expect(value(view.container, 'favorite')).toBe('false')
    expect(value(view.container, 'pending')).toBe('false')
    expect(value(view.container, 'error')).toBe('sin conexión')
  })

  it('quita inmediatamente un favorito y confirma la baja al finalizar la solicitud', async () => {
    mocks.list.mockResolvedValue([product])
    let finish!: () => void
    mocks.remove.mockReturnValue(new Promise<void>(resolve => { finish = resolve }))
    const view = await renderReact(<FavoritesProvider><Probe /></FavoritesProvider>)
    cleanups.push(view.cleanup)
    await flushReact()

    expect(value(view.container, 'favorite')).toBe('true')
    await act(async () => view.container.querySelector('button')?.click())

    expect(value(view.container, 'count')).toBe('0')
    expect(value(view.container, 'pending')).toBe('true')
    expect(mocks.remove).toHaveBeenCalledWith(product.id)

    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(value(view.container, 'pending')).toBe('false')
  })
})
