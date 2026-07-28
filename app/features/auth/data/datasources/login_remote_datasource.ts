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

      if (authError) {
        const msg = authError.message.toLowerCase()

        // Si l'e-mail n'est pas confirmé
        if (msg.includes("email not confirmed")) {
          // On tente un renvoi sécurisé de l'OTP sans bloquer en cas de rate-limit (429)
          try {
            await this.supabase.auth.resend({
              type: 'signup',
              email: emailClean
            })
          } catch (err) {
            console.warn('[LoginRemoteDatasource] Rate limit atteint lors du renvoi OTP.')
          }

          throw new UserUnconfirmedException(emailClean)
        }

        throw new AuthException(this.translateError(authError.message))
      }

      if (!authData.user || !authData.session) {
        throw new AuthException("Identifiants invalides.")
      }

      const token = authData.session.access_token

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
    return message
  }
}