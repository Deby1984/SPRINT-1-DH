/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, AUTH_INVALIDATED_EVENT, authApi, tokenStore } from './api'

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
