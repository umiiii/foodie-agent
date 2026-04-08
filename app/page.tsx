import { getAllRestaurants } from '@/lib/mock-data'
import RestaurantCard from '@/components/RestaurantCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const restaurants = await getAllRestaurants()

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Restaurants</h1>
      <p className="text-gray-500 mb-6">Choose a restaurant to start your order</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </>
  )
}
