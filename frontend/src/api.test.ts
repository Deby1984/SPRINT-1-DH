/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AUTH_INVALIDATED_EVENT, authApi, tokenStore } from './api'

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
