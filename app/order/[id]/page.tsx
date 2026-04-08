'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Order } from '@/lib/types'

const statusSteps = ['pending', 'paid', 'preparing', 'delivering', 'delivered'] as const
const statusLabels: Record<string, string> = {
  pending: 'Awaiting Payment',
  paid: 'Payment Confirmed',
  preparing: 'Preparing',
  delivering: 'Out for Delivery',
  delivered: 'Delivered',
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function poll() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) throw new Error('Order not found')
        const data = await res.json()
        if (active) setOrder(data.order)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Error')
      }
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [id])

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/" className="text-orange-600 hover:underline">
          Back to restaurants
        </Link>
      </div>
    )
  }

  if (!order) {
    return <p className="text-center py-20 text-gray-400">Loading order...</p>
  }

  const currentIdx = statusSteps.indexOf(order.status as typeof statusSteps[number])

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-4"
      >
        &larr; Back to restaurants
      </Link>

      <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
      <p className="text-gray-500 mb-6">{order.restaurantName}</p>

      {/* Status stepper */}
      <div className="flex items-center gap-1 mb-8">
        {statusSteps.map((step, i) => (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-2 rounded-full ${
                i <= currentIdx ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
            <span
              className={`text-xs ${
                i <= currentIdx ? 'text-orange-600 font-medium' : 'text-gray-400'
              }`}
            >
              {statusLabels[step]}
            </span>
          </div>
        ))}
      </div>

      {/* Pay button for pending orders */}
      {order.status === 'pending' && (
        <a
          href={`/api/orders/${order.id}/pay`}
          className="block text-center w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition mb-6"
        >
          Pay Now - ${order.totalAmount.toFixed(2)}
        </a>
      )}

      {/* Order items */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.menuItemId} className="flex justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span className="text-gray-600">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-gray-100">
          <span>Delivery fee</span>
          <span>${order.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Created: {new Date(order.createdAt).toLocaleString()}
        {order.paidAt && <> | Paid: {new Date(order.paidAt).toLocaleString()}</>}
      </p>
    </>
  )
}
