import Link from 'next/link'
import type { Restaurant } from '@/lib/types'

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
    >
      <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-4xl">
        {cuisineEmoji(restaurant.cuisine)}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
            {restaurant.name}
          </h3>
          <span className="shrink-0 text-sm font-medium text-amber-600">
            {restaurant.rating}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {restaurant.description}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{restaurant.cuisine}</span>
          <span>{restaurant.deliveryTime}</span>
          <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
        </div>
      </div>
    </Link>
  )
}

function cuisineEmoji(cuisine: string) {
  const map: Record<string, string> = {
    Singaporean: '\uD83C\uDDF8\uD83C\uDDEC',
    Japanese: '\uD83C\uDDEF\uD83C\uDDF5',
    Indian: '\uD83C\uDDEE\uD83C\uDDF3',
    Western: '\uD83C\uDDFA\uD83C\uDDF8',
    Thai: '\uD83C\uDDF9\uD83C\uDDED',
  }
  return map[cuisine] ?? '\uD83C\uDF7D\uFE0F'
}
