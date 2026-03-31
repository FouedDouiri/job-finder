<script setup lang="ts">
import type { Job } from '~/types'

const props = defineProps<{
  jobs: Job[]
  userLat: number | null
  userLng: number | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
const isLoading = ref(true)

let map: any = null
let markers: any[] = []
let L: any = null
let plotInterval: ReturnType<typeof setInterval> | null = null

const locationStore = useLocationStore()

async function initMap() {
  if (!mapContainer.value) return

  L = await import('leaflet')

  if (!document.querySelector('#leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const center: [number, number] = props.userLat && props.userLng
    ? [props.userLat, props.userLng]
    : [51.1657, 10.4515]

  map = L.map(mapContainer.value, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView(center, props.userLat ? 7 : 5)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)

  if (props.userLat && props.userLng) {
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:16px;height:16px;
        background:#3b82f6;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(59,130,246,0.3);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
    L.marker([props.userLat, props.userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong style="font-size:13px">Your location</strong>')
  }

  isLoading.value = false

  // kick off background geocoding for all unique cities
  const cities = [...new Set(props.jobs.map(j => j.location).filter(Boolean))]
  await locationStore.geocodeCities(cities)

  // poll every 1.5s to add newly geocoded markers as they come in
  plotInterval = setInterval(() => plotCached(), 1500)

  // plot whatever is already cached immediately
  plotCached()
}

// Build location → jobs map once
const locationMap = computed(() => {
  const map = new Map<string, Job[]>()
  for (const job of props.jobs) {
    if (!job.location) continue
    if (!map.has(job.location)) map.set(job.location, [])
    map.get(job.location)!.push(job)
  }
  return map
})

function plotCached() {
  if (!map || !L) return

  // clear existing markers
  markers.forEach(m => m.remove())
  markers = []

  for (const [city, cityJobs] of locationMap.value.entries()) {
    const coords = locationStore.getCached(city)
    if (!coords) continue

    const count = cityJobs.length

    const markerIcon = L.divIcon({
      className: '',
      html: `<div style="
        background:#1d4ed8;
        color:white;
        font-size:11px;
        font-weight:600;
        padding:4px 8px;
        border-radius:20px;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        border:2px solid white;
        font-family:system-ui,sans-serif;
      ">${count} job${count > 1 ? 's' : ''}</div>`,
      iconAnchor: [20, 10],
    })

    const popupContent = `
      <div style="font-family:system-ui,sans-serif;min-width:200px;max-width:240px">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#111">${city}</div>
        <div style="font-size:12px;color:#666;margin-bottom:8px">${count} position${count > 1 ? 's' : ''} available</div>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
          ${cityJobs.slice(0, 5).map(j => `
            <li style="border-top:1px solid #f0f0f0;padding-top:6px">
              <a href="${j.url}" target="_blank" style="color:#1d4ed8;text-decoration:none;font-size:12px;font-weight:500">${j.title}</a>
              <div style="color:#888;font-size:11px;margin-top:1px">${j.company_name}</div>
            </li>
          `).join('')}
          ${count > 5 ? `<li style="font-size:11px;color:#aaa;border-top:1px solid #f0f0f0;padding-top:6px">+${count - 5} more positions</li>` : ''}
        </ul>
      </div>
    `

    const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(popupContent, { maxWidth: 260 })

    markers.push(marker)
  }
}

onMounted(() => initMap())

onUnmounted(() => {
  if (map) map.remove()
  if (plotInterval) clearInterval(plotInterval)
})

watch(() => props.jobs, async (newJobs) => {
  const cities = [...new Set(newJobs.map(j => j.location).filter(Boolean))]
  await locationStore.geocodeCities(cities)
  plotCached()
}, { deep: true })
</script>

<template>
  <div class="relative w-full h-full">
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3"
      >
        <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-gray-500 font-medium">Loading map...</p>
      </div>
    </Transition>

    <div ref="mapContainer" class="w-full h-full rounded-xl" />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border: 1px solid #f0f0f0;
  padding: 0;
}
:deep(.leaflet-popup-content) { margin: 14px; }
:deep(.leaflet-popup-tip) { box-shadow: none; }
</style>