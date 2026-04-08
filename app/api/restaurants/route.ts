import { getAllRestaurants } from '@/lib/mock-data'

export async function GET() {
  return Response.json({ restaurants: getAllRestaurants() })
}
