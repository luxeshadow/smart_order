// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    paygateApiKey: process.env.PAYGATE_API_KEY,
    public: {
      geminiApiKey: process.env.VITE_GEMINI_KEY,
      geminiProjectId: process.env.VITE_GEMINI_PROJECT_ID,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      
    }
  },

  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Smart Orders',
      short_name: 'SmartOrders',
      description: 'Gestion intelligente des commandes',
      theme_color: '#ffffff',
      start_url: '/home',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      maximumFileSizeToCacheInBytes: 3145728,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    devOptions: {
      enabled: true,
      type: 'classic'
    }
  },

  imports: {
    dirs: ['core/**']
  },

  app: {
    head: {
      title: 'Smart Orders',
      
     
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/toastify-js',
          type: 'text/javascript'
        },
         {
        src: 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.9.1/tsparticles.confetti.bundle.min.js',
        defer: true
      }
      ],
      link: [
        { 
          rel: 'icon', 
          type: 'image/x-icon', 
          href: '/favicon.ico' 
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  }
})