import type { LocationState } from '~/types'

const geocodeCache = new Map<string, { lat: number; lng: number }>()
const geocodeQueue: string[] = []
let isProcessingQueue = false

export const useLocationStore = defineStore('location', () => {
  const state = ref<LocationState>({
    lat: null,
    lng: null,
    city: null,
    loading: false,
    error: null,
  })

  async function processQueue() {
    if (isProcessingQueue) return
    isProcessingQueue = true

    while (geocodeQueue.length > 0) {
      const city = geocodeQueue.shift()!
      if (geocodeCache.has(city)) continue

      try {
        const result = await $fetch<{ lat: number; lng: number } | null>('/api/geocode', {
          params: { city },
        })
        if (result) geocodeCache.set(city, result)
      } catch {
        // skip silently
      }

      // Nominatim rate limit: 1 req/sec
      await new Promise(resolve => setTimeout(resolve, 1100))
    }

    isProcessingQueue = false
  }

  async function geocodeCities(cities: string[]): Promise<void> {
    const unique = [...new Set(cities)].filter(c => c && !geocodeCache.has(c))
    if (!unique.length) return
    geocodeQueue.push(...unique)
    processQueue() // intentionally not awaited — runs in background
  }

  async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
    if (geocodeCache.has(city)) return geocodeCache.get(city)!

    try {
      const result = await $fetch<{ lat: number; lng: number } | null>('/api/geocode', {
        params: { city },
      })
      if (result) geocodeCache.set(city, result)
      return result
    } catch {
      return null
    }
  }

  async function detectLocation() {
    if (!import.meta.client) return

    state.value.loading = true
    state.value.error = null

    navigator.geolocation.getCurrentPosition(
      async position => {
        state.value.lat = position.coords.latitude
        state.value.lng = position.coords.longitude
        state.value.loading = false
      },
      () => {
        state.value.error = 'Location access denied.'
        state.value.loading = false
      }
    )
  }

  function getCached(city: string) {
    return geocodeCache.get(city) ?? null
  }

  return {
    state,
    detectLocation,
    geocodeCity,
    geocodeCities,
    getCached,
  }
})