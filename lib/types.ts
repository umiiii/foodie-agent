export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  image: string
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'delivering'
  | 'delivered'

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  createdAt: string
  paidAt?: string
}
