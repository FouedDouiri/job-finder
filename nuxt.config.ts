import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps:{
      include:[ '@vue/devtools-core', '@vue/devtools-core'],
    }
  },
  css: ['~/assets/css/main.css'],
})