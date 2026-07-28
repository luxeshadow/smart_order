import { AuthException, DatabaseException, UserUnconfirmedException } from '@/core/errors/exception'
import { UserModel } from '../models/user_model'
import type { LoginParam } from '../../application/params/login_params'

export class LoginRemoteDatasource {
  constructor(private supabase: any) {}

  async login(param: LoginParam): Promise<UserModel> {
    try {
      const emailClean = param.email.trim().toLowerCase()

      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: emailClean,
        password: param.password,
      })

      // 1. Gestion des erreurs d'authentification
      if (authError || !authData.user || !authData.session) {
        const msg = authError?.message?.toLowerCase() || ''

        // Si l'e-mail n'est pas confirmé, on lève l'exception dédiée SANS refaire d'appel Supabase
        if (msg.includes("email not confirmed")) {
          throw new UserUnconfirmedException(emailClean)
        }

        throw new AuthException(this.translateError(authError?.message))
      }

      const token = authData.session.access_token

      // 2. Récupération du profil utilisateur (exactement comme dans ton ancien code)
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        throw new DatabaseException("Impossible de récupérer le profil utilisateur.")
      }

      return UserModel.fromSupabase(
        userData,
        token,
        authData.user.email
      )

    } catch (error: any) {
      if (
        error instanceof AuthException || 
        error instanceof DatabaseException ||
        error instanceof UserUnconfirmedException
      ) {
        throw error
      }
      throw new DatabaseException(error.message || "Erreur de connexion au serveur.")
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Identifiants invalides."
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect."
    if (message.includes("Email not confirmed")) return "Veuillez confirmer votre email avant de vous connecter."
    return message
  }
}