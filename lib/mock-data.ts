import type { Restaurant, MenuItem } from './types'
import { fetchRestaurants, fetchRestaurantDetail } from './foodpanda'
import { cacheGet, cacheSet } from './cache'

export async function getAllRestaurants(): Promise<Restaurant[]> {
  return fetchRestaurants()
}

export async function getRestaurant(id: string): Promise<Restaurant | undefined> {
  // Try cached restaurant list first
  const restaurants = cacheGet<Restaurant[]>('restaurants')
  const fromList = restaurants?.find((r) => r.id === id)
  if (fromList) return fromList

  // Fetch from API
  try {
    const { restaurant } = await fetchRestaurantDetail(id)
    return restaurant
  } catch {
    return undefined
  }
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  try {
    const { menu } = await fetchRestaurantDetail(restaurantId)
    return menu
  } catch {
    return []
  }
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
  // MenuItem id format: {vendorCode}_{productId}
  const parts = id.split('_')
  if (parts.length < 2) return undefined

  const vendorCode = parts[0]

  // Check menu items cache
  const cacheKey = `menu_items_${vendorCode}`
  let items = cacheGet<MenuItem[]>(cacheKey)

  if (!items) {
    try {
      const { menu } = await fetchRestaurantDetail(vendorCode)
      items = menu
      cacheSet(cacheKey, items, 15 * 60 * 1000)
    } catch {
      return undefined
    }
  }

  return items.find((item) => item.id === id)
}
