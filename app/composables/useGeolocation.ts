export const useGeolocation = () => {
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function initLocation() {
    if (!navigator.geolocation) {
      error.value = 'Not supported'
      return
    }

    loading.value = true

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat.value = pos.coords.latitude
        lng.value = pos.coords.longitude
        loading.value = false
      },
      (err) => {
        error.value = err.message
        loading.value = false
      }
    )
  }

  return { lat, lng, loading, error, initLocation }
}