import type {
  AuthResult,
  Availability,
  Category,
  Characteristic,
  FieldErrors,
  Product,
  ProductFilter,
  ProductPage,
  Reservation,
  Review,
  ReviewEligibility,
  ReviewSummary,
  User,
} from './types'

const TOKEN_KEY = 'horizonte.jwt'
export const AUTH_INVALIDATED_EVENT = 'horizonte:auth-invalidated'

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(reason: unknown): reason is ApiError {
  return reason instanceof ApiError
}

function errorBody(value: unknown): { status?: number; message?: string; fieldErrors: FieldErrors } {
  if (!value || typeof value !== 'object') return { fieldErrors: {} }
  const body = value as Record<string, unknown>
  const status = typeof body.status === 'number' && Number.isFinite(body.status) ? body.status : undefined
  const message = typeof body.message === 'string' && body.message.trim() ? body.message : undefined
  const fieldErrors: FieldErrors = {}
  if (body.fieldErrors && typeof body.fieldErrors === 'object' && !Array.isArray(body.fieldErrors)) {
    for (const [field, messageValue] of Object.entries(body.fieldErrors as Record<string, unknown>)) {
      if (typeof messageValue === 'string') fieldErrors[field] = messageValue
    }
  }
  return { status, message, fieldErrors }
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
    const parsed = errorBody(await result.json().catch(() => null))
    throw new ApiError(
      parsed.status ?? result.status,
      parsed.message ?? 'Ocurrió un error inesperado.',
      parsed.fieldErrors,
    )
  }
  return result.status === 204 ? undefined as T : result.json() as Promise<T>
}

const json = (method: string, body?: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })

function queryString(values: Record<string, string | number[] | undefined>) {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(values)) {
    if (Array.isArray(value)) value.forEach(item => params.append(name, String(item)))
    else if (value !== undefined && value !== '') params.set(name, value)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const productsApi = {
  list: (page = 0) => response<ProductPage>(request(`/api/products?page=${page}&size=10`)),
  random: () => response<Product[]>(request('/api/products/random?limit=10')),
  filter: (ids: number[]) => response<ProductFilter>(request(`/api/products/filter${ids.length ? `?categoryIds=${ids.join(',')}` : ''}`)),
  cities: (query = '') => response<string[]>(request(`/api/products/cities${queryString({ query })}`)),
  search: (criteria: { city: string; checkIn: string; checkOut: string; categoryIds?: number[] }) =>
    response<Product[]>(request(`/api/products/search${queryString(criteria)}`)),
  get: (id: string) => response<Product>(request(`/api/products/${id}`)),
  availability: (id: string | number) => response<Availability>(request(`/api/products/${id}/availability`)),
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

export const reservationsApi = {
  create: (data: { productId: number; checkIn: string; checkOut: string }) =>
    response<Reservation>(request('/api/reservations', json('POST', data))),
  mine: () => response<Reservation[]>(request('/api/reservations/me')),
}

export const favoritesApi = {
  list: () => response<Product[]>(request('/api/favorites')),
  add: (productId: number) => response<Product>(request(`/api/favorites/${productId}`, { method: 'PUT' })),
  remove: (productId: number) => response<void>(request(`/api/favorites/${productId}`, { method: 'DELETE' })),
}

export const reviewsApi = {
  list: (productId: number) => response<ReviewSummary>(request(`/api/products/${productId}/reviews`)),
  eligibility: (productId: number) => response<ReviewEligibility>(request(`/api/reviews/eligibility${queryString({ productId: String(productId) })}`)),
  create: (data: { productId: number; rating: number; comment: string }) =>
    response<Review>(request('/api/reviews', json('POST', data))),
}
