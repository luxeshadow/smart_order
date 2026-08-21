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
    /*
     * ==========================
     * RÉCUPÉRATION UTILISATEUR
     * ==========================
     */

    const {
      data: { user: authUser },
      error: userError
    } = await supabase.auth.getUser()

    /*
     * ==========================
     * NON CONNECTÉ
     * ==========================
     */

    if (userError || !authUser) {
      if (authPages.includes(to.path)) {
        return
      }

      if (to.path.startsWith('/dashboard')) {
        return navigateTo('/auth/login', {
          replace: true
        })
      }

      // Laisser les pages publiques accessibles
      return
    }

    /*
     * ==========================
     * UTILISATEUR CONNECTÉ
     * ==========================
     */

    const {
      data: dbUser,
      error: dbError
    } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    if (dbError) {
      console.error(
        'Erreur récupération utilisateur :',
        dbError
      )

      return
    }

    if (!dbUser) {
      console.error(
        'Utilisateur absent de la table users'
      )

      await supabase.auth.signOut()

      return navigateTo('/auth/login', {
        replace: true
      })
    }

    const role = dbUser.role

    /*
     * ==========================
     * PAGE LOGIN / REGISTER
     * ==========================
     */

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

    /*
     * ==========================
     * PROTECTION ADMIN
     * ==========================
     */

    if (
      to.path.startsWith('/dashboard') &&
      role !== 'admin'
    ) {
      return navigateTo('/home', {
        replace: true
      })
    }

    // Sinon laisser Nuxt continuer normalement
    return

  } catch (error) {
    console.error(
      'Erreur middleware auth :',
      error
    )

    if (to.path.startsWith('/dashboard')) {
      return navigateTo('/auth/login', {
        replace: true
      })
    }
  }
})