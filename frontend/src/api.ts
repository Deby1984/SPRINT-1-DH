import type { AuthResult, Category, Characteristic, Product, ProductFilter, ProductPage, User } from './types'

const TOKEN_KEY = 'horizonte.jwt'
export const AUTH_INVALIDATED_EVENT = 'horizonte:auth-invalidated'

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY)
}

async function request(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const result = await fetch(input, { ...init, headers })

  // Un 401 invalida solamente el token usado por esta solicitud. La
  // comparación evita que una respuesta antigua borre una sesión nueva.
  if (result.status === 401 && token && tokenStore.get() === token) {
    tokenStore.clear()
    window.dispatchEvent(new Event(AUTH_INVALIDATED_EVENT))
  }

  return result
}

async function response<T>(pending: Promise<Response>): Promise<T> {
  const result = await pending
  if (!result.ok) {
    const body = await result.json().catch(() => ({ message: 'Ocurrió un error inesperado.' }))
    throw new Error(body.message ?? 'Ocurrió un error inesperado.')
  }
  return result.status === 204 ? undefined as T : result.json() as Promise<T>
}

const json = (method: string, body?: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })

export const productsApi = {
  list: (page = 0) => response<ProductPage>(request(`/api/products?page=${page}&size=10`)),
  random: () => response<Product[]>(request('/api/products/random?limit=10')),
  filter: (ids: number[]) => response<ProductFilter>(request(`/api/products/filter${ids.length ? `?categoryIds=${ids.join(',')}` : ''}`)),
  get: (id: string) => response<Product>(request(`/api/products/${id}`)),
  create: (data: FormData) => response<Product>(request('/api/products', { method: 'POST', body: data })),
  update: (id: string, data: FormData) => response<Product>(request(`/api/products/${id}`, { method: 'PUT', body: data })),
  remove: (id: number) => response<void>(request(`/api/products/${id}`, { method: 'DELETE' }))
}

export const categoriesApi = {
  list: () => response<Category[]>(request('/api/categories')),
  create: (data: Omit<Category, 'id'>) => response<Category>(request('/api/categories', json('POST', data))),
  update: (id: number, data: Omit<Category, 'id'>) => response<Category>(request(`/api/categories/${id}`, json('PUT', data))),
  remove: (id: number) => response<void>(request(`/api/categories/${id}`, { method: 'DELETE' }))
}

export const characteristicsApi = {
  list: () => response<Characteristic[]>(request('/api/characteristics')),
  create: (data: Omit<Characteristic, 'id'>) => response<Characteristic>(request('/api/characteristics', json('POST', data))),
  update: (id: number, data: Omit<Characteristic, 'id'>) => response<Characteristic>(request(`/api/characteristics/${id}`, json('PUT', data))),
  remove: (id: number) => response<void>(request(`/api/characteristics/${id}`, { method: 'DELETE' }))
}

export const authApi = {
  me: () => response<User>(request('/api/auth/me')),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => response<AuthResult>(request('/api/auth/register', json('POST', data))),
  login: (data: { email: string; password: string }) => response<AuthResult>(request('/api/auth/login', json('POST', data))),
  logout: () => response<void>(request('/api/auth/logout', { method: 'POST' }))
}

export const usersApi = {
  list: () => response<User[]>(request('/api/users')),
  changeRole: (id: number, role: User['role']) => response<User>(request(`/api/users/${id}/role`, json('PATCH', { role })))
}
