import { useAuthStore } from "@/features/auth/presentation/stores/auth_store";

export default defineNuxtRouteMiddleware(async (to) => {

  if (!to.path.startsWith('/order')) return

  const authStore = useAuthStore()

  // On attend impérativement que l'init soit finie si l'user n'est pas encore chargé
  if (!authStore.user) {
    await authStore.initUser() 
  }

  if (!authStore.user) {
    return navigateTo('/auth/login')
  }
})