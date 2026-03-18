import type { LocationState } from '~/types'

const geocodeCache = new Map<string, { lat: number; lng: number }>()

export const useLocationStore = defineStore('location', () => {
  const state = ref<LocationState>({
    lat: null,
    lng: null,
    city: null,
    loading: false,
    error: null,
  })

  async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
    if (geocodeCache.has(city)) return geocodeCache.get(city)!

    try {
      const results = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
        params: { q: city, format: 'json', limit: 1 },
        headers: { 'Accept-Language': 'en' },
      })

      if (!results.length) return null

      const coords = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
      geocodeCache.set(city, coords)
      return coords
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
      err => {
        state.value.error = 'Location access denied.'
        state.value.loading = false
      }
    )
  }

  return { state, detectLocation, geocodeCity }
})