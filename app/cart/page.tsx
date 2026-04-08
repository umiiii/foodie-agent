'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function CartPage() {
  const { state, removeItem, setQuantity, clear, subtotal, total, itemCount } =
    useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function placeOrder() {
    if (!state.restaurantId || state.items.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: state.restaurantId,
          items: state.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const { order } = await res.json()
      clear()
      router.push(`/order/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (itemCount === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Your cart is empty</p>
        <Link
          href="/"
          className="text-orange-600 font-medium hover:underline"
        >
          Browse restaurants
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Your Cart</h1>
      <p className="text-gray-500 mb-6">
        Ordering from <span className="font-medium text-gray-700">{state.restaurantName}</span>
      </p>

      <div className="space-y-3 mb-6">
        {state.items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-white"
          >
            <div className="min-w-0">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                ${item.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(item.menuItemId, item.quantity - 1)}
                className="w-7 h-7 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => setQuantity(item.menuItemId, item.quantity + 1)}
                className="w-7 h-7 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.menuItemId)}
                className="ml-2 text-xs text-red-500 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2 mb-6">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Delivery fee</span>
          <span>${state.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? 'Creating order...' : 'Place Order'}
      </button>
    </>
  )
}
