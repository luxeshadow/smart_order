import type { User } from '@supabase/supabase-js'

type DbUser = {
  role: 'admin' | 'client' | string
}

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useApi()

  // Pages d'authentification publiques
  const authPages = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ]

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    let authUser: User | undefined = session?.user ?? undefined

    if (!authUser && !sessionError) {
      const { data: { user } } = await supabase.auth.getUser()
      authUser = user ?? undefined
    }

    if (!authUser) {
      // Si on va déjà sur une page d'auth, on laisse passer
      if (authPages.includes(to.path)) {
        return
      }

      if (to.path.startsWith('/dashboard')) {
        return navigateTo('/auth/login')
      }

      if (to.path !== '/home') {
        return navigateTo('/home')
      }
      return
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    // Si le token est valide mais que l'utilisateur n'existe pas ou plus en BDD
    if (dbError || !dbUser) {

      await supabase.auth.signOut()
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
    console.error('Erreur Critique Middleware Auth :', error)
    
    if (to.path.startsWith('/dashboard')) {
      return navigateTo('/auth/login')
    }
    return navigateTo('/home')
  }
})