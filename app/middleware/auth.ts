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
    // 1. Récupérer la session actuelle (Recommandé pour le SSR)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Correction du type : On convertit le 'User | null' de Supabase en 'User | undefined'
    let authUser: User | undefined = session?.user ?? undefined

    // Sécurité : Si pas de session trouvée dans les cookies, on tente un getUser
    if (!authUser && !sessionError) {
      const { data: { user } } = await supabase.auth.getUser()
      authUser = user ?? undefined
    }

    // 2. CAS : UTILISATEUR NON CONNECTÉ
    if (!authUser) {
      // Si on va déjà sur une page d'auth, on laisse passer
      if (authPages.includes(to.path)) {
        return
      }

      // Si on tente d'accéder au dashboard sans être connecté -> Login
      if (to.path.startsWith('/dashboard')) {
        return navigateTo('/auth/login')
      }

      // Pour le reste (comme /my-order), redirection vers la home
      if (to.path !== '/home') {
        return navigateTo('/home')
      }
      return
    }

    // 3. CAS : UTILISATEUR CONNECTÉ -> Vérification du rôle en Base de données
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single<DbUser>()

    // Si le token est valide mais que l'utilisateur n'existe pas ou plus en BDD
    if (dbError || !dbUser) {
      // On force la déconnexion locale pour éviter une boucle infinie de redirections
      await supabase.auth.signOut()
      return navigateTo('/auth/login')
    }

    const role = dbUser.role

    // Si déjà connecté et tente d'aller sur une page d'auth (Login/Register)
    if (authPages.includes(to.path)) {
      if (role === 'admin') {
        return navigateTo('/dashboard')
      }
      return navigateTo('/home')
    }

    // Protection stricte des routes Dashboard
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