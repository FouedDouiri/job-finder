<script setup lang="ts">
import type { Job } from '~/types'

const props = defineProps<{ job: Job }>()

const formattedDate = computed(() => {
  return new Date(props.job.created_at * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})
</script>

<template>
  <a 
    :href="job.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <h2 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
          {{ job.title }}
        </h2>

        <!-- Company + location -->
        <p class="text-sm text-gray-500 mt-1">
          {{ job.company_name }} · {{ job.location }}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mt-3">
          <span
            v-if="job.remote"
            class="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-md"
          >
            Remote
          </span>
          <span
            v-for="tag in job.tags.slice(0, 4)"
            :key="tag"
            class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Date -->
      <span class="text-xs text-gray-400 shrink-0 mt-1">{{ formattedDate }}</span>
    </div>
  </a>
</template>