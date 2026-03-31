import { AuthException, DatabaseException } from '@/core/errors/exception'
import { UserModel } from '../models/user_model'
import type { LoginParam } from '../../application/params/login_params'

export class LoginRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async login(param: LoginParam): Promise<UserModel> {
    try {
      let emailToUse = param.email
      if (param.phoneNumber && !param.email) {
        const { data: userData, error: dbError } = await this.supabase
          .from('users')
          .select('email')
          .eq('phone_number', param.phoneNumber)
          .maybeSingle()

        if (dbError) throw new DatabaseException(dbError.message)
        if (!userData) throw new AuthException("Aucun compte n'est associé à ce numéro de téléphone.")
        
        emailToUse = userData.email
      }

      // 2. Tentative de connexion avec l'email et le mot de passe
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: emailToUse,
        password: param.password,
      })

      if (authError || !authData.user) {
        throw new AuthException(this.translateError(authError?.message))
      }

      // 3. Récupération des infos complètes du profil dans ta table 'users'
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        throw new DatabaseException("Impossible de récupérer le profil utilisateur.")
      }

      return UserModel.fromSupabase(userData)

    } catch (error: any) {
      if (error instanceof AuthException || error instanceof DatabaseException) throw error
      throw new DatabaseException(error.message || "Erreur de connexion au serveur.")
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Identifiants invalides."
    if (message.includes("Invalid login credentials")) return "Email/Téléphone ou mot de passe incorrect."
    if (message.includes("Email not confirmed")) return "Veuillez confirmer votre email avant de vous connecter."
    return message
  }
}