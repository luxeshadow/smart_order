import type { User } from '@supabase/supabase-js'

type DbUser = {
  role: 'admin' | 'client' | string
}

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useApi()

  const authPages = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ]

  try {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    let authUser: User | undefined =
      session?.user ?? undefined

    if (!authUser && !sessionError) {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      authUser = user ?? undefined
    }

    /*
     * ============================
     * UTILISATEUR NON CONNECTÉ
     * ============================
     */
    if (!authUser) {
      // Les pages d'auth restent accessibles
      if (authPages.includes(to.path)) {
        return
      }

      // Dashboard interdit sans connexion
      if (to.path.startsWith('/dashboard')) {
        return navigateTo('/auth/login', {
          replace: true
        })
      }

      /*
       * Ton comportement actuel :
       * les autres routes renvoient vers home.
       */
      if (to.path !== '/home') {
        return navigateTo('/home', {
          replace: true
        })
      }

      return
    }

    /*
     * ============================
     * UTILISATEUR CONNECTÉ
     * ============================
     */

    const {
      data: dbUser,
      error: dbError
    } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    /*
     * Session valide mais utilisateur absent
     * dans la table users.
     */
    if (dbError || !dbUser) {
      await supabase.auth.signOut()

      return navigateTo('/auth/login', {
        replace: true
      })
    }

    const role = dbUser.role


    if (authPages.includes(to.path)) {
      if (role === 'admin') {
        return navigateTo('/dashboard', {
          replace: true
        })
      }

      return navigateTo('/home', {
        replace: true
      })
    }

    if (to.path.startsWith('/dashboard')) {
      if (role !== 'admin') {
        return navigateTo('/home', {
          replace: true
        })
      }
    }

  } catch (error) {
    console.error(
      'Erreur Critique Middleware Auth :',
      error
    )

    if (to.path.startsWith('/dashboard')) {
      return navigateTo('/auth/login', {
        replace: true
      })
    }

    return navigateTo('/home', {
      replace: true
    })
  }
})