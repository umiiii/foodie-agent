import type { Order, OrderItem, OrderStatus } from './types'

const orders = new Map<string, Order>()

export function createOrder(data: {
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  deliveryFee: number
}): Order {
  const id = crypto.randomUUID().slice(0, 8)
  const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const order: Order = {
    id,
    restaurantId: data.restaurantId,
    restaurantName: data.restaurantName,
    items: data.items,
    status: 'pending',
    totalAmount: Math.round((subtotal + data.deliveryFee) * 100) / 100 * 0.001,
    deliveryFee: data.deliveryFee,
    createdAt: new Date().toISOString(),
  }
  orders.set(id, order)
  return order
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id)
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = orders.get(id)
  if (!order) return undefined
  order.status = status
  return order
}

export function markOrderPaid(id: string): Order | undefined {
  const order = orders.get(id)
  if (!order || order.status !== 'pending') return undefined

  order.status = 'paid'
  order.paidAt = new Date().toISOString()

  // Simulate order lifecycle progression
  setTimeout(() => updateOrderStatus(id, 'preparing'), 10_000)
  setTimeout(() => updateOrderStatus(id, 'delivering'), 30_000)
  setTimeout(() => updateOrderStatus(id, 'delivered'), 60_000)

  return order
}

export function getAllOrders(): Order[] {
  return Array.from(orders.values())
}
