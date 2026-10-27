/** @vitest-environment jsdom */
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../types'
import { flushReact, renderReact } from '../../test/reactTestUtils'

const mocks = vi.hoisted(() => ({
  availability: vi.fn(),
}))

vi.mock('../../api', () => ({
  productsApi: { availability: mocks.availability },
  reservationsApi: { create: vi.fn() },
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({ user: null }),
}))

import { AvailabilitySection } from './AvailabilitySection'

const product: Product = {
  id: 5,
  name: 'Casa del Valle',
  description: 'Una casa tranquila.',
  categoryId: 2,
  category: 'Casas',
  city: 'Salta',
  price: 106000,
  images: [],
  characteristics: [],
  policies: [],
  averageRating: 0,
  reviewCount: 0,
}

const cleanups: Array<() => Promise<void>> = []

beforeEach(() => {
  mocks.availability.mockReset()
})

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.()
})

describe('AvailabilitySection', () => {
  it('traduce el error de red y permite reintentar la carga', async () => {
    mocks.availability
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ productId: product.id, occupiedRanges: [] })

    const view = await renderReact(
      <MemoryRouter>
        <AvailabilitySection product={product} />
      </MemoryRouter>,
    )
    cleanups.push(view.cleanup)
    await flushReact()

    expect(view.container.textContent).toContain('No pudimos cargar la disponibilidad. Intentá nuevamente.')
    expect(view.container.textContent).not.toContain('Failed to fetch')

    const retry = [...view.container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'Intentar nuevamente')
    expect(retry).toBeDefined()

    await act(async () => {
      retry?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mocks.availability).toHaveBeenCalledTimes(2)
    expect(view.container.textContent).not.toContain('No pudimos cargar la disponibilidad.')
  })
})
