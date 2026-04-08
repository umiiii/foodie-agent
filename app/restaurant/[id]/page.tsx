import { notFound } from 'next/navigation'
import { getRestaurant, getMenuItems } from '@/lib/mock-data'
import MenuItemCard from '@/components/MenuItemCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = await getRestaurant(id)
  if (!restaurant) notFound()

  const menu = await getMenuItems(id)
  const categories = [...new Set(menu.map((item) => item.category))]

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-4"
      >
        &larr; Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-gray-500 mt-1">{restaurant.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
          <span>{restaurant.cuisine}</span>
          {restaurant.rating > 0 && <span>{restaurant.rating} rating</span>}
          <span>{restaurant.deliveryTime}</span>
          <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
          {restaurant.minimumOrderAmount > 0 && (
            <span>Min ${restaurant.minimumOrderAmount.toFixed(2)}</span>
          )}
          {!restaurant.isOpen && (
            <span className="text-red-500 font-medium">Closed</span>
          )}
        </div>
      </div>

      {menu.length === 0 && (
        <p className="text-gray-400 py-8 text-center">
          Menu not available. Set FOODPANDA_SESSION_TOKEN to fetch full menus.
        </p>
      )}

      {categories.map((cat) => (
        <section key={cat} className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">{cat}</h2>
          <div className="grid gap-2">
            {menu
              .filter((item) => item.category === cat)
              .map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  restaurant={restaurant}
                />
              ))}
          </div>
        </section>
      ))}
    </>
  )
}
