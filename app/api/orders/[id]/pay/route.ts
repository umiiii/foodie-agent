import { mppx } from '@/lib/mpp'
import { getOrder, markOrderPaid } from '@/lib/orders'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const order = getOrder(id)

  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return Response.json({ error: 'Order is not pending payment' }, { status: 400 })
  }

  // Dynamic amount gated by MPP 402
  const result = await mppx.charge({
    amount: order.totalAmount.toFixed(2),
    description: `Order #${order.id} - ${order.restaurantName}`,
  })(request)

  if (result.status === 402) {
    return result.challenge
  }

  // Payment verified — update order status
  const updated = markOrderPaid(order.id)

  return result.withReceipt(
    Response.json({
      success: true,
      message: 'Payment confirmed. Your order is being prepared!',
      order: updated,
    }),
  )
}

// Allow GET for browser-based HTML payment flow
export { POST as GET }
