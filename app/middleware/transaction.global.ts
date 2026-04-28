import { useAuthStore } from "@/features/auth/presentation/stores/auth_store";

export default defineNuxtRouteMiddleware((to) => {

  if (!to.path.startsWith('/transaction')) return

  const authStore = useAuthStore()

  if (!authStore.user) {
    authStore.initUser()
  }

  if (!authStore.user) {
    return navigateTo('/auth/login')
  }
})