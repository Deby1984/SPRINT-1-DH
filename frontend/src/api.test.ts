/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  AUTH_INVALIDATED_EVENT,
  authApi,
  favoritesApi,
  productsApi,
  reservationsApi,
  reviewsApi,
  tokenStore,
} from './api'

function unauthorized() {
  return new Response(JSON.stringify({ message: 'La sesión ya no es válida.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('invalidación global de autenticación', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('elimina el JWT y notifica a AuthProvider cuando la API responde 401', async () => {
    tokenStore.set('token-vencido')
    const listener = vi.fn()
    window.addEventListener(AUTH_INVALIDATED_EVENT, listener)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(unauthorized()))

    await expect(authApi.me()).rejects.toThrow('La sesión ya no es válida.')

    expect(tokenStore.get()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener(AUTH_INVALIDATED_EVENT, listener)
  })

  it('no elimina una sesión nueva por la respuesta tardía de un token anterior', async () => {
    tokenStore.set('token-anterior')
    let resolveRequest!: (response: Response) => void
    const pendingResponse = new Promise<Response>(resolve => { resolveRequest = resolve })
    const listener = vi.fn()
    window.addEventListener(AUTH_INVALIDATED_EVENT, listener)
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pendingResponse))

    const oldRequest = authApi.me()
    tokenStore.set('token-nuevo')
    resolveRequest(unauthorized())
    await expect(oldRequest).rejects.toThrow('La sesión ya no es válida.')

    expect(tokenStore.get()).toBe('token-nuevo')
    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener(AUTH_INVALIDATED_EVENT, listener)
  })
})

describe('errores de la API', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('conserva el estado, el mensaje y los errores por campo del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 400,
      message: 'Hay datos inválidos en la solicitud.',
      fieldErrors: {
        email: 'debe ser una dirección de correo electrónico con formato correcto',
        password: 'el tamaño debe estar entre 8 y 72',
      },
    }), { status: 400, headers: { 'Content-Type': 'application/json' } })))

    const pending = authApi.register({ firstName: 'Ana', lastName: 'Paz', email: 'mal', password: 'corta' })

    await expect(pending).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Hay datos inválidos en la solicitud.',
      fieldErrors: {
        email: 'debe ser una dirección de correo electrónico con formato correcto',
        password: 'el tamaño debe estar entre 8 y 72',
      },
    })
  })

  it('crea un ApiError seguro cuando la respuesta no contiene JSON válido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 503 })))

    const pending = authApi.login({ email: 'ana@example.com', password: 'segura123' })

    await expect(pending).rejects.toEqual(new ApiError(503, 'Ocurrió un error inesperado.'))
  })

  it('descarta valores de fieldErrors que no sean texto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 422,
      message: 'Error de validación',
      fieldErrors: { email: 'Correo inválido', price: 123, images: null },
    }), { status: 400, headers: { 'Content-Type': 'application/json' } })))

    let error: unknown
    try {
      await authApi.login({ email: 'mal', password: 'segura123' })
    } catch (reason) {
      error = reason
    }

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, fieldErrors: { email: 'Correo inválido' } })
  })
})

describe('contratos HTTP del Sprint 3', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it('construye búsqueda, reserva, favoritos y valoraciones con los métodos esperados', async () => {
    tokenStore.set('token-prueba')
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const body = url.includes('/search') ? '[]'
        : url.includes('/eligibility') ? '{"eligible":false,"message":"Pendiente"}'
          : '{}'
      return Promise.resolve(new Response(init?.method === 'DELETE' ? null : body, {
        status: init?.method === 'DELETE' ? 204 : 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    })
    vi.stubGlobal('fetch', fetchMock)

    await productsApi.search({ city: 'San Martín', checkIn: '2026-11-10', checkOut: '2026-11-12', categoryIds: [2, 4] })
    await reservationsApi.create({ productId: 7, checkIn: '2026-11-10', checkOut: '2026-11-12' })
    await favoritesApi.add(7)
    await favoritesApi.remove(7)
    await reviewsApi.eligibility(7)
    await reviewsApi.create({ productId: 7, rating: 5, comment: 'Excelente' })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/products/search?city=San+Mart%C3%ADn&checkIn=2026-11-10&checkOut=2026-11-12&categoryIds=2&categoryIds=4')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST', body: JSON.stringify({ productId: 7, checkIn: '2026-11-10', checkOut: '2026-11-12' }) })
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'PUT' })
    expect(fetchMock.mock.calls[3][1]).toMatchObject({ method: 'DELETE' })
    expect(fetchMock.mock.calls[4][0]).toBe('/api/reviews/eligibility?productId=7')
    expect(fetchMock.mock.calls[5][1]).toMatchObject({ method: 'POST', body: JSON.stringify({ productId: 7, rating: 5, comment: 'Excelente' }) })
    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-prueba')
    }
  })
})
