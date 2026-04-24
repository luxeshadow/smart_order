export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/order')) return

  const supabase = useApi()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return navigateTo('/auth/login')
  }
})