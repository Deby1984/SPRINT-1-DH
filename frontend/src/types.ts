export type Category = { id: number; title: string; description: string; imageUrl: string }
export type Characteristic = { id: number; name: string; icon: string }
export type ProductPolicy = { title: string; description: string }
export type Product = {
  id: number
  name: string
  description: string
  categoryId: number | null
  category: string
  city: string
  price: number
  images: string[]
  characteristics: Characteristic[]
  policies: ProductPolicy[]
  averageRating: number
  reviewCount: number
}
export type ProductPage = { content: Product[]; totalPages: number; totalElements: number; number: number; size: number }
export type ProductFilter = { products: Product[]; filteredCount: number; totalCount: number }
export type User = { id: number; firstName: string; lastName: string; email: string; role: 'USER' | 'ADMIN' }
export type AuthResult = { token: string; user: User }
export type FieldErrors = Record<string, string>

export type DateRange = { checkIn: string | null; checkOut: string | null }
export type OccupiedRange = { checkIn: string; checkOut: string }
export type Availability = { productId: number; occupiedRanges: OccupiedRange[] }
export type ReservationStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED'
export type Reservation = {
  id: number
  productId: number
  productName: string
  checkIn: string
  checkOut: string
  status: ReservationStatus
}

export type Review = {
  id: number
  rating: number
  comment: string
  userName: string
  createdAt: string
}
export type ReviewSummary = {
  reviews: Review[]
  averageRating: number
  reviewCount: number
}
export type ReviewEligibility = { eligible: boolean; message: string }
