import type { Category, Characteristic, Product, ProductFilter, ProductPage, User } from './types'

async function response<T>(request: Promise<Response>): Promise<T> {
  const result = await request
  if (!result.ok) {
    const body = await result.json().catch(() => ({ message: 'Ocurrió un error inesperado.' }))
    throw new Error(body.message ?? 'Ocurrió un error inesperado.')
  }
  return result.status === 204 ? undefined as T : result.json() as Promise<T>
}

const json = (method: string, body?: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })

export const productsApi = {
  list: (page = 0) => response<ProductPage>(fetch(`/api/products?page=${page}&size=10`)),
  random: () => response<Product[]>(fetch('/api/products/random?limit=10')),
  filter: (ids: number[]) => response<ProductFilter>(fetch(`/api/products/filter${ids.length ? `?categoryIds=${ids.join(',')}` : ''}`)),
  get: (id: string) => response<Product>(fetch(`/api/products/${id}`)),
  create: (data: FormData) => response<Product>(fetch('/api/products', { method: 'POST', body: data })),
  update: (id: string, data: FormData) => response<Product>(fetch(`/api/products/${id}`, { method: 'PUT', body: data })),
  remove: (id: number) => response<void>(fetch(`/api/products/${id}`, { method: 'DELETE' }))
}

export const categoriesApi = {
  list: () => response<Category[]>(fetch('/api/categories')),
  create: (data: Omit<Category, 'id'>) => response<Category>(fetch('/api/categories', json('POST', data))),
  update: (id: number, data: Omit<Category, 'id'>) => response<Category>(fetch(`/api/categories/${id}`, json('PUT', data))),
  remove: (id: number) => response<void>(fetch(`/api/categories/${id}`, { method: 'DELETE' }))
}

export const characteristicsApi = {
  list: () => response<Characteristic[]>(fetch('/api/characteristics')),
  create: (data: Omit<Characteristic, 'id'>) => response<Characteristic>(fetch('/api/characteristics', json('POST', data))),
  update: (id: number, data: Omit<Characteristic, 'id'>) => response<Characteristic>(fetch(`/api/characteristics/${id}`, json('PUT', data))),
  remove: (id: number) => response<void>(fetch(`/api/characteristics/${id}`, { method: 'DELETE' }))
}

export const authApi = {
  me: () => response<User>(fetch('/api/auth/me')),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => response<User>(fetch('/api/auth/register', json('POST', data))),
  login: (data: { email: string; password: string }) => response<User>(fetch('/api/auth/login', json('POST', data))),
  logout: () => response<void>(fetch('/api/auth/logout', { method: 'POST' }))
}

export const usersApi = {
  list: () => response<User[]>(fetch('/api/users')),
  changeRole: (id: number, role: User['role']) => response<User>(fetch(`/api/users/${id}/role`, json('PATCH', { role })))
}
