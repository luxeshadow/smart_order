// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  },

  modules: ['@pinia/nuxt'],

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