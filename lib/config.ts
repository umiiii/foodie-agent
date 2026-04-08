export type Region = 'sg' | 'hk'

interface RegionConfig {
  name: string
  appName: string
  apiBase: string
  latitude: number
  longitude: number
  locale: string
  languageId: number
  entityId: string
}

const REGIONS: Record<Region, RegionConfig> = {
  sg: {
    name: 'Singapore',
    appName: 'FoodSG',
    apiBase: 'https://sg.fd-api.com',
    latitude: 1.2794418,
    longitude: 103.8545553,
    locale: 'en_SG',
    languageId: 1,
    entityId: 'FP_SG',
  },
  hk: {
    name: 'Hong Kong',
    appName: 'FoodHK',
    apiBase: 'https://hk.fd-api.com',
    latitude: 22.281485,
    longitude: 114.1823758,
    locale: 'en_HK',
    languageId: 1,
    entityId: 'FP_HK',
  },
}

export const REGION: Region = (process.env.NEXT_PUBLIC_REGION as Region) || 'sg'
export const config = REGIONS[REGION]
