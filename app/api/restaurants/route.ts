import { getAllRestaurants } from '@/lib/mock-data'

export async function GET() {
  const restaurants = await getAllRestaurants()
  return Response.json({ restaurants })
}
