type DbUser = {
  role: 'admin' | 'client' | string
}

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useApi()

  try {
    const {
      data: { user: authUser },
      error: authError
    } = await supabase.auth.getUser()

    // Pages auth
    const authPages = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ]

    // Non connecté
    if (authError || !authUser) {

      // accès libre aux pages auth
      if (authPages.includes(to.path)) {
        return
      }

      // dashboard => login
      if (to.path.startsWith('/dashboard')) {
        return navigateTo('/auth/login')
      }

      // autres pages protégées => home
      return navigateTo('/home')
    }

    // Récupération role
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    if (dbError || !dbUser) {
      return navigateTo('/auth/login')
    }

    const role = dbUser.role

    // Empêcher accès aux pages auth si déjà connecté
    if (authPages.includes(to.path)) {

      if (role === 'admin') {
        return navigateTo('/dashboard')
      }

      return navigateTo('/home')
    }

    // Protection dashboard
    if (to.path.startsWith('/dashboard')) {

      if (role !== 'admin') {
        return navigateTo('/home')
      }
    }

  } catch (error) {

    if (to.path.startsWith('/dashboard')) {
      return navigateTo('/auth/login')
    }

    return navigateTo('/home')
  }
})