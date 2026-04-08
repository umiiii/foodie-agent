import Link from 'next/link'
import type { Restaurant } from '@/lib/types'

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
    >
      {restaurant.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={restaurant.heroImage}
          alt={restaurant.name}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-4xl">
          {cuisineEmoji(restaurant.cuisine)}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
            {restaurant.name}
          </h3>
          {restaurant.rating > 0 && (
            <span className="shrink-0 text-sm font-medium text-amber-600">
              {restaurant.rating}
            </span>
          )}
        </div>
        {restaurant.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {restaurant.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{restaurant.cuisine}</span>
          <span>{restaurant.deliveryTime}</span>
          <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
          {!restaurant.isOpen && (
            <span className="text-red-500 font-medium">Closed</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function cuisineEmoji(cuisine: string) {
  const lower = cuisine.toLowerCase()
  const map: Record<string, string> = {
    singaporean: '\uD83C\uDDF8\uD83C\uDDEC',
    japanese: '\uD83C\uDDEF\uD83C\uDDF5',
    indian: '\uD83C\uDDEE\uD83C\uDDF3',
    western: '\uD83C\uDDFA\uD83C\uDDF8',
    american: '\uD83C\uDDFA\uD83C\uDDF8',
    thai: '\uD83C\uDDF9\uD83C\uDDED',
    chinese: '\uD83C\uDDE8\uD83C\uDDF3',
    korean: '\uD83C\uDDF0\uD83C\uDDF7',
    italian: '\uD83C\uDDEE\uD83C\uDDF9',
    mexican: '\uD83C\uDDF2\uD83C\uDDFD',
    indonesian: '\uD83C\uDDEE\uD83C\uDDE9',
    asian: '\uD83C\uDF5C',
    dessert: '\uD83C\uDF70',
    cakes: '\uD83C\uDF82',
    porridge: '\uD83C\uDF5A',
    soups: '\uD83C\uDF5C',
  }
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji
  }
  return '\uD83C\uDF7D\uFE0F'
}
