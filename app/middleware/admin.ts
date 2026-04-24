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

    if (authError || !authUser) {
      return navigateTo('/auth/login')
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    if (dbError || !dbUser) {
      return navigateTo('/auth/login')
    }

    if (dbUser.role !== 'admin') {
      return navigateTo('/auth/login')
    }


  } catch (error) {
    return navigateTo('/auth/login')
  }
})