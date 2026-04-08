'use client'

import type { MenuItem, Restaurant } from '@/lib/types'
import { useCart } from '@/context/CartContext'

export default function MenuItemCard({
  item,
  restaurant,
}: {
  item: MenuItem
  restaurant: Restaurant
}) {
  const { addItem } = useCart()

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-100 hover:border-orange-200 transition">
      <div className="min-w-0">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
          {item.description}
        </p>
        <p className="mt-1 text-sm font-semibold text-orange-600">
          ${item.price.toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => addItem(item, restaurant)}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 active:scale-95 transition cursor-pointer"
      >
        + Add
      </button>
    </div>
  )
}
