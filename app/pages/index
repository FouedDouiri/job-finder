<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const jobsStore = useJobsStore()
const { state: location, initLocation } = useGeolocation()

onMounted(async () => {
  await jobsStore.fetchJobs(1)
})

const handleSearch = useDebounceFn((val: string) => {
  jobsStore.filters.search = val
}, 300)

function handleRemoteToggle() {
  if (jobsStore.filters.remote === null) jobsStore.filters.remote = true
  else if (jobsStore.filters.remote === true) jobsStore.filters.remote = false
  else jobsStore.filters.remote = null
}

const remoteLabel = computed(() => {
  if (jobsStore.filters.remote === null) return 'All'
  if (jobsStore.filters.remote === true) return 'Remote'
  return 'On-site'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <h1 class="text-xl font-semibold text-gray-900 shrink-0">Job Finder</h1>

        <div class="flex items-center gap-3 flex-1 max-w-2xl">
          <!-- Search -->
          <input
            type="text"
            placeholder="Search jobs or companies..."
            class="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="handleSearch(($event.target as HTMLInputElement).value)"
          />

          <!-- Remote filter -->
          <button
            class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            :class="jobsStore.filters.remote === null
              ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
              : 'border-blue-500 text-blue-600 bg-blue-50'"
            @click="handleRemoteToggle"
          >
            {{ remoteLabel }}
          </button>

          <!-- Location -->
          <button
            class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            :class="location.lat
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            @click="initLocation"
          >
            {{ location.loading ? 'Locating...' : location.lat ? 'Located' : 'Use location' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-6xl mx-auto px-4 py-6">

      <!-- Stats -->
      <p class="text-sm text-gray-500 mb-4">
        {{ jobsStore.filteredJobs.length }} jobs found
      </p>

      <!-- Error -->
      <div v-if="jobsStore.error" class="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
        {{ jobsStore.error }}
      </div>

      <!-- Job list -->
      <div class="grid gap-3">
        <JobCard
          v-for="job in jobsStore.filteredJobs"
          :key="job.slug"
          :job="job"
        />
      </div>

      <!-- Loading skeleton -->
      <div v-if="jobsStore.loading" class="grid gap-3 mt-3">
        <div
          v-for="n in 5"
          :key="n"
          class="h-28 bg-white rounded-xl border border-gray-100 animate-pulse"
        ></div>
      </div>

      <!-- Load more -->
      <div class="mt-8 flex justify-center">
        <button
          v-if="jobsStore.hasMore && !jobsStore.loading"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="jobsStore.loadMore"
        >
          Load more jobs
        </button>
        <p v-else-if="!jobsStore.loading" class="text-sm text-gray-400">
          No more jobs
        </p>
      </div>

    </main>
  </div>
</template>