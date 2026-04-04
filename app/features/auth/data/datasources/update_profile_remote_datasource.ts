import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { UpdateProfileParam } from '../../application/params/update_profile_params'

export class UpdateProfileRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async updateProfile(param: UpdateProfileParam): Promise<void> {
    try {
      // 1. Mise à jour des infos d'authentification (Email, Password, Phone)
      // Si l'email change, Supabase gère l'envoi de l'OTP automatiquement
      const { error: authError } = await this.supabase.auth.updateUser({
        email: param.email !== param.currentEmail ? param.email : undefined,
        phone: param.phoneNumber, // Supabase Auth utilise souvent 'phone'
        data: { 
          username: param.userName 
        }
      })

      if (authError) {
        throw new AuthException(this.translateError(authError.message))
      }

      // 2. Mise à jour de ta table 'profiles' (si tu stockes le username dedans)
      const { error: dbError } = await this.supabase
        .from('users')
        .update({ 
          username: param.userName,
          phone_number: param.phoneNumber 
        })
        .eq('id', param.userId)

      if (dbError) {
        throw new DatabaseException("Impossible de mettre à jour les informations en base de données.")
      }

    } catch (error: any) {
      if (error instanceof AuthException || error instanceof DatabaseException) throw error
      throw new DatabaseException("Problème de connexion au serveur.")
    }
  }

  private translateError(message: string): string {
    const msg = message.toLowerCase()
    if (msg.includes("email address already exists")) return "Cette adresse email est déjà utilisée."
    if (msg.includes("phone already exists")) return "Ce numéro de téléphone est déjà utilisé."
    return message
  }
}