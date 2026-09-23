export type Product = { id: number; name: string; description: string; category: string; city: string; price: number; images: string[] }
export type ProductPage = { content: Product[]; totalPages: number; totalElements: number; number: number; size: number }
