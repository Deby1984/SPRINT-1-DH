export type Category = { id: number; title: string; description: string; imageUrl: string }
export type Characteristic = { id: number; name: string; icon: string }
export type Product = { id: number; name: string; description: string; categoryId: number | null; category: string; city: string; price: number; images: string[]; characteristics: Characteristic[] }
export type ProductPage = { content: Product[]; totalPages: number; totalElements: number; number: number; size: number }
export type ProductFilter = { products: Product[]; filteredCount: number; totalCount: number }
export type User = { id: number; firstName: string; lastName: string; email: string; role: 'USER' | 'ADMIN' }
