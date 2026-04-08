export interface Restaurant {
  id: string
  name: string
  description: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  image: string
  vendorCode: string
  heroImage: string
  minimumOrderAmount: number
  isOpen: boolean
}

export interface MenuItemVariation {
  id: string
  name: string
  price: number
}

export interface ToppingOption {
  id: string
  name: string
  price: number
}

export interface ToppingGroup {
  id: string
  name: string
  quantityMin: number
  quantityMax: number
  options: ToppingOption[]
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  category: string
  image: string
  variations?: MenuItemVariation[]
  toppings?: ToppingGroup[]
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
