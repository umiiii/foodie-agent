import { getRestaurant, getMenuItem } from '@/lib/mock-data'
import { createOrder } from '@/lib/orders'

export async function POST(request: Request) {
  const body = await request.json()
  const { restaurantId, items } = body as {
    restaurantId: string
    items: { menuItemId: string; quantity: number }[]
  }

  if (!restaurantId || !items?.length) {
    return Response.json(
      { error: 'restaurantId and items[] are required' },
      { status: 400 },
    )
  }

  const restaurant = getRestaurant(restaurantId)
  if (!restaurant) {
    return Response.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  const orderItems = []
  for (const item of items) {
    const menuItem = getMenuItem(item.menuItemId)
    if (!menuItem) {
      return Response.json(
        { error: `Menu item ${item.menuItemId} not found` },
        { status: 400 },
      )
    }
    if (menuItem.restaurantId !== restaurantId) {
      return Response.json(
        { error: `Item ${item.menuItemId} does not belong to restaurant ${restaurantId}` },
        { status: 400 },
      )
    }
    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    })
  }

  const order = createOrder({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    items: orderItems,
    deliveryFee: restaurant.deliveryFee,
  })

  return Response.json(
    { order, payUrl: `/api/orders/${order.id}/pay` },
    { status: 201 },
  )
}
