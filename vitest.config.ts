import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    globals: true, // Pour éviter d'importer 'describe' et 'it' partout
  }
})