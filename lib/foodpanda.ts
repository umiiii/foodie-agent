import type { Restaurant, MenuItem, ToppingGroup } from './types'
import { cacheGet, cacheSet } from './cache'

const GRAPHQL_URL = 'https://sg.fd-api.com/graphql'
const REST_BASE = 'https://sg.fd-api.com'

const VENDOR_LIST_HASH = 'eecccb80814fbd2449f3fb1317985de351781b373cb7d322c294e50725d3df2d'

const LATITUDE = 1.2794418
const LONGITUDE = 103.8545553

// Generate stable session IDs for the server lifetime
const perseusClientId = `${Date.now()}.${Math.random().toString().slice(2, 20)}.${Math.random().toString(36).slice(2, 12)}`
const perseusSessionId = `${Date.now()}.${Math.random().toString().slice(2, 20)}.${Math.random().toString(36).slice(2, 12)}`

function makeDpsSessionId(): string {
  const payload = {
    session_id: crypto.randomUUID().replace(/-/g, ''),
    perseus_id: perseusClientId,
    timestamp: Math.floor(Date.now() / 1000),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

const dpsSessionId = makeDpsSessionId()

function graphqlHeaders(): Record<string, string> {
  return {
    'accept': 'application/json',
    'apollographql-client-name': 'web',
    'apollographql-client-version': 'VENDOR-LIST-MICROFRONTEND.26.14.0020',
    'app-version': 'VENDOR-LIST-MICROFRONTEND.26.14.0020',
    'authorization': '',
    'content-type': 'application/json;charset=UTF-8',
    'customer-code': 'undefined',
    'customer-latitude': String(LATITUDE),
    'customer-longitude': String(LONGITUDE),
    'display-context': 'rlp',
    'dps-session-id': dpsSessionId,
    'locale': 'en_SG',
    'perseus-client-id': perseusClientId,
    'perseus-session-id': perseusSessionId,
    'platform': 'web',
    'x-fp-api-key': 'volo',
    'x-apollo-operation-name': 'GetVendorListPage',
  }
}

function restHeaders(): Record<string, string> {
  const token = process.env.FOODPANDA_SESSION_TOKEN
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'x-fp-api-key': 'volo',
    'locale': 'en_SG',
    'platform': 'web',
    'perseus-client-id': perseusClientId,
    'perseus-session-id': perseusSessionId,
    'dps-session-id': dpsSessionId,
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  }
  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }
  return headers
}

// ─── GraphQL: Vendor List ────────────────────────────────────────

interface VendorDataGQL {
  code: string
  name: string
  availability: { status: string }
  images: { listing: string; logo: string }
  vendorRating: { value: number; count: number } | null
  timeEstimations: {
    delivery: {
      duration: { lowerLimitInMinutes: number; upperLimitInMinutes: number } | null
    } | null
  }
  dynamicPricing: {
    deliveryFee: { total: number } | null
    minimumOrderValue: { total: number } | null
  } | null
  vendorTile: {
    vendorInfo: Array<Array<{
      id: string
      elements: Array<{ __typename: string; text?: string }>
    }>>
  }
  urlKey: string
}

function extractCuisine(vendorData: VendorDataGQL): string {
  const vendorInfo = vendorData.vendorTile?.vendorInfo ?? []
  for (const group of vendorInfo) {
    for (const item of group) {
      if (item.id === 'VENDOR_INFO_CUISINES') {
        const texts = item.elements
          .filter((e) => e.__typename === 'VendorTileText' && e.text)
          .map((e) => e.text!)
        return texts.join(', ') || 'Restaurant'
      }
    }
  }
  return 'Restaurant'
}

function vendorToRestaurant(v: VendorDataGQL): Restaurant {
  const duration = v.timeEstimations?.delivery?.duration
  const lower = duration?.lowerLimitInMinutes ?? 20
  const upper = duration?.upperLimitInMinutes ?? 40

  return {
    id: v.code,
    vendorCode: v.code,
    name: v.name,
    description: '',
    cuisine: extractCuisine(v),
    rating: v.vendorRating?.value ?? 0,
    deliveryTime: `${lower}-${upper} min`,
    deliveryFee: v.dynamicPricing?.deliveryFee?.total ?? 0,
    image: v.images?.listing ?? '',
    heroImage: v.images?.listing ?? '',
    minimumOrderAmount: v.dynamicPricing?.minimumOrderValue?.total ?? 0,
    isOpen: v.availability?.status === 'OPEN',
  }
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const cached = cacheGet<Restaurant[]>('restaurants')
  if (cached) return cached

  try {
  const body = {
    extensions: {
      persistedQuery: { sha256Hash: VENDOR_LIST_HASH, version: 1 },
    },
    variables: {
      input: {
        expeditionType: 'DELIVERY',
        latitude: LATITUDE,
        locale: 'en_SG',
        longitude: LONGITUDE,
        customerType: 'B2C',
        featureFlags: [
          { name: 'dynamic-pricing-indicator', value: 'Variant' },
          { name: 'saver-delivery-upper-funnel', value: 'Variation1' },
          { name: 'pd-mp-homescreen-full-federation-listing', value: 'Control' },
          { name: 'vdp_citadel-tech-integration', value: 'Control' },
          { name: 'pd-mp-slp-replatform-federated', value: 'Variation1' },
        ],
        languageId: 1,
        page: 'RESTAURANT_LANDING_PAGE',
        vendorFilters: {
          budgets: [],
          cuisineIds: [],
          foodCharacteristicIds: [],
          paymentTypes: [],
          deliveryProviders: [],
          discountLabels: [],
          hasDiscount: false,
          hasFreeDelivery: false,
          hasOnlinePayment: false,
          hasVoucher: false,
          isSuperVendor: false,
          verticalTypesIds: [],
        },
        availabilityFilters: {},
      },
    },
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: graphqlHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error(`[foodpanda] GraphQL error: ${res.status}`)
    return []
  }

  const json = await res.json()
  const components = json?.data?.vendorListingPage?.components ?? []
  const restaurants = components
    .filter((c: { __typename: string }) => c.__typename === 'VendorComponent')
    .map((c: { vendorData: VendorDataGQL }) => vendorToRestaurant(c.vendorData))

  cacheSet('restaurants', restaurants, 5 * 60 * 1000) // 5 min
  return restaurants
  } catch (err) {
    console.error('[foodpanda] Failed to fetch restaurants:', err instanceof Error ? err.message : err)
    return []
  }
}

// ─── REST: Vendor Detail + Menu ──────────────────────────────────

interface FPProductVariation {
  id: number
  code: string
  name: string
  price: number
  price_before_discount?: number
}

interface FPProduct {
  id: number
  code: string
  name: string
  description: string
  product_variations: FPProductVariation[]
  images?: Array<{ image_url: string }>
  topping_ids?: number[]
  file_path?: string
}

interface FPMenuCategory {
  name: string
  description?: string
  products: FPProduct[]
}

interface FPTopping {
  id: number
  name: string
  quantity_minimum: number
  quantity_maximum: number
  options: Array<{
    id: number
    name: string
    price: number
  }>
}

interface FPVendorDetail {
  code: string
  name: string
  description?: string
  rating?: number
  hero_image?: string
  hero_listing_image?: string
  minimum_delivery_fee?: number
  minimum_order_amount?: number
  is_active?: boolean
  menus?: Array<{
    menu_categories: FPMenuCategory[]
    toppings?: FPTopping[] | Record<string, FPTopping>
  }>
  cuisines?: Array<{ name: string }>
  customer_type?: string
  budget?: number
  delivery_fee_type?: string
}

function fixImageUrl(url: string): string {
  if (!url) return ''
  return url.replace(/%s/g, '300')
}

function transformMenuData(
  vendorCode: string,
  vendor: FPVendorDetail,
): { restaurant: Restaurant; menu: MenuItem[] } {
  const cuisineNames = vendor.cuisines?.map((c) => c.name).join(', ') || 'Restaurant'

  const restaurant: Restaurant = {
    id: vendorCode,
    vendorCode,
    name: vendor.name,
    description: vendor.description || '',
    cuisine: cuisineNames,
    rating: vendor.rating ?? 0,
    deliveryTime: '',
    deliveryFee: vendor.minimum_delivery_fee ?? 0,
    image: fixImageUrl(vendor.hero_listing_image || vendor.hero_image || ''),
    heroImage: fixImageUrl(vendor.hero_image || vendor.hero_listing_image || ''),
    minimumOrderAmount: vendor.minimum_order_amount ?? 0,
    isOpen: vendor.is_active ?? true,
  }

  const menuItems: MenuItem[] = []
  const menus = vendor.menus ?? []

  // Build toppings dictionary
  const toppingsDict = new Map<number, FPTopping>()
  for (const menu of menus) {
    const toppings = menu.toppings
    if (Array.isArray(toppings)) {
      for (const t of toppings) {
        toppingsDict.set(t.id, t)
      }
    } else if (toppings && typeof toppings === 'object') {
      for (const t of Object.values(toppings)) {
        toppingsDict.set(t.id, t)
      }
    }
  }

  for (const menu of menus) {
    for (const category of menu.menu_categories) {
      for (const product of category.products) {
        const defaultVariation = product.product_variations[0]
        const price = defaultVariation?.price ?? 0

        const variations = product.product_variations.length > 1
          ? product.product_variations.map((pv) => ({
              id: String(pv.id),
              name: pv.name,
              price: pv.price,
            }))
          : undefined

        const toppingGroups: ToppingGroup[] | undefined =
          product.topping_ids && product.topping_ids.length > 0
            ? product.topping_ids
                .map((tid) => {
                  const t = toppingsDict.get(tid)
                  if (!t) return null
                  return {
                    id: String(t.id),
                    name: t.name,
                    quantityMin: t.quantity_minimum,
                    quantityMax: t.quantity_maximum,
                    options: t.options.map((o) => ({
                      id: String(o.id),
                      name: o.name,
                      price: o.price,
                    })),
                  }
                })
                .filter((t): t is ToppingGroup => t !== null)
            : undefined

        const imageUrl = product.images?.[0]?.image_url
          ?? product.file_path
          ?? ''

        menuItems.push({
          id: `${vendorCode}_${product.id}`,
          restaurantId: vendorCode,
          name: product.name,
          description: product.description || '',
          price,
          category: category.name,
          image: fixImageUrl(imageUrl),
          variations,
          toppings: toppingGroups,
        })
      }
    }
  }

  return { restaurant, menu: menuItems }
}

export async function fetchRestaurantDetail(
  vendorCode: string,
): Promise<{ restaurant: Restaurant; menu: MenuItem[] }> {
  const cacheKey = `vendor_${vendorCode}`
  const cached = cacheGet<{ restaurant: Restaurant; menu: MenuItem[] }>(cacheKey)
  if (cached) return cached

  // Fallback: return basic info from GraphQL restaurant list
  async function fallback(): Promise<{ restaurant: Restaurant; menu: MenuItem[] }> {
    const restaurants = await fetchRestaurants()
    const basic = restaurants.find((r) => r.vendorCode === vendorCode)
    if (basic) {
      return { restaurant: basic, menu: [] }
    }
    throw new Error(`Vendor ${vendorCode} not found`)
  }

  try {
    const url = `${REST_BASE}/api/v5/vendors/${encodeURIComponent(vendorCode)}?include=menus,bundles,multiple_discounts&latitude=${LATITUDE}&longitude=${LONGITUDE}&language_id=1&dynamic_pricing=0`

    const res = await fetch(url, { headers: restHeaders() })

    if (!res.ok) {
      console.warn(`[foodpanda] REST API returned ${res.status} for vendor ${vendorCode}`)
      return fallback()
    }

    const json = await res.json()
    const data = json.data ?? json

    // Check if we got a PX challenge instead of vendor data
    if (data.appId && data.blockScript) {
      console.warn(`[foodpanda] REST API returned PX challenge for vendor ${vendorCode}. Set FOODPANDA_SESSION_TOKEN env var to fetch menus.`)
      return fallback()
    }

    const result = transformMenuData(vendorCode, data as FPVendorDetail)

    // Merge GraphQL data if restaurant fields are missing
    if (!result.restaurant.description || !result.restaurant.deliveryTime) {
      const restaurants = cacheGet<Restaurant[]>('restaurants')
      const gqlRestaurant = restaurants?.find((r) => r.vendorCode === vendorCode)
      if (gqlRestaurant) {
        if (!result.restaurant.deliveryTime) {
          result.restaurant.deliveryTime = gqlRestaurant.deliveryTime
        }
        if (!result.restaurant.cuisine || result.restaurant.cuisine === 'Restaurant') {
          result.restaurant.cuisine = gqlRestaurant.cuisine
        }
      }
    }

    cacheSet(cacheKey, result, 15 * 60 * 1000) // 15 min
    return result
  } catch (err) {
    console.error(`[foodpanda] Failed to fetch vendor ${vendorCode}:`, err instanceof Error ? err.message : err)
    return fallback()
  }
}
