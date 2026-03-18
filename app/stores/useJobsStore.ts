import type { Job, JobsResponse, JobFilters } from '~/types'

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)

  const filters = ref<JobFilters>({
    search: '',
    remote: null,
    tag: null,
  })

  const filteredJobs = computed(() => {
    return jobs.value.filter(job => {
      const matchesSearch =
        !filters.value.search ||
        job.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        job.company_name.toLowerCase().includes(filters.value.search.toLowerCase())

      const matchesRemote =
        filters.value.remote === null || job.remote === filters.value.remote

      const matchesTag =
        !filters.value.tag ||
        job.tags.some(t => t.toLowerCase().includes(filters.value.tag!.toLowerCase()))

      return matchesSearch && matchesRemote && matchesTag
    })
  })

  async function fetchJobs(page = 1) {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = { page: String(page) }
      if (filters.value.tag) params.tag = filters.value.tag

      const data = await $fetch<JobsResponse>('https://www.arbeitnow.com/api/job-board-api', {
        params,
      })

      if (page === 1) {
        jobs.value = data.data
      } else {
        jobs.value.push(...data.data)
      }

      hasMore.value = data.links.next !== null
      currentPage.value = page
    } catch (e) {
      error.value = 'Failed to fetch jobs. Please try again.'
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return
    await fetchJobs(currentPage.value + 1)
  }

  function resetAndFetch() {
    jobs.value = []
    currentPage.value = 1
    hasMore.value = true
    fetchJobs(1)
  }

  return {
    jobs,
    filteredJobs,
    loading,
    error,
    filters,
    hasMore,
    currentPage,
    fetchJobs,
    loadMore,
    resetAndFetch,
  }
})