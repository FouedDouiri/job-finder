export function useGeolocation() {
  const locationStore = useLocationStore()
  const jobsStore = useJobsStore()

  const nearbyJobs = computed(() => {
    if (!locationStore.state.lat || !locationStore.state.lng) {
      return []
    }

    return jobsStore.filteredJobs.filter(job => job.location).slice(0, 20)
  })

  async function initLocation() {
    await locationStore.detectLocation()
  }

  return {
    state: locationStore.state,
    nearbyJobs,
    initLocation,
  }
}