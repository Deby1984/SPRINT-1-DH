import type { Product, ProductPage } from './types'

const API = '/api/products'

async function response<T>(request: Promise<Response>): Promise<T> {
  const result = await request
  if (!result.ok) {
    const body = await result.json().catch(() => ({ message: 'Ocurrió un error inesperado.' }))
    throw new Error(body.message ?? 'Ocurrió un error inesperado.')
  }
  return result.status === 204 ? undefined as T : result.json() as Promise<T>
}

export const productsApi = {
  list: (page = 0) => response<ProductPage>(fetch(`${API}?page=${page}&size=10`)),
  random: () => response<Product[]>(fetch(`${API}/random?limit=10`)),
  get: (id: string) => response<Product>(fetch(`${API}/${id}`)),
  create: (data: FormData) => response<Product>(fetch(API, { method: 'POST', body: data })),
  remove: (id: number) => response<void>(fetch(`${API}/${id}`, { method: 'DELETE' }))
}
