export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const city = query.city as string

  if (!city) throw createError({ statusCode: 400, message: 'city is required' })

  const results = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
    params: { q: city, format: 'json', limit: 1 },
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'job-finder-app/1.0',
    },
  })

  if (!results.length) return null

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  }
})