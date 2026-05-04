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

    // ROUTES AUTH
    const authPages = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ]

    // UTILISATEUR NON CONNECTÉ
    if (authError || !authUser) {

      // accès autorisé aux pages auth
      if (authPages.includes(to.path)) {
        return
      }

      // sinon retour login
      return navigateTo('/auth/login')
    }

    // RECUP ROLE
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    if (dbError || !dbUser) {
      return navigateTo('/auth/login')
    }

    const role = dbUser.role

    if (authPages.includes(to.path)) {

      if (role === 'admin') {
        return navigateTo('/dashboard')
      }

      return navigateTo('/home')
    }

  
    if (to.path.startsWith('/dashboard')) {

      if (role !== 'admin') {
        return navigateTo('/home')
      }
    }

  } catch (error) {

    return navigateTo('/auth/login')
  }
})