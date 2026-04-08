import { getRestaurant, getMenuItems } from '@/lib/mock-data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const restaurant = await getRestaurant(id)
  if (!restaurant) {
    return Response.json({ error: 'Restaurant not found' }, { status: 404 })
  }
  const menu = await getMenuItems(id)
  return Response.json({ restaurant, menu })
}
