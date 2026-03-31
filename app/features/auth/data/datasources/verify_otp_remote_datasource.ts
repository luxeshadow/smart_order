import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { VerifyOtpParam } from '../../application/params/verify_otp_params'

export class VerifyOtpRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }


  async verifyOtp(param: VerifyOtpParam): Promise<void> {
  try {
    const { data, error: authError } = await this.supabase.auth.verifyOtp({
      email: param.email,
      token: param.otp,
      type: 'signup' 
    })

    if (authError) {
      throw new AuthException(this.translateError(authError.message))
    }

    if (!data.user) {
      throw new AuthException("Session utilisateur introuvable.")
    }

  } catch (error: any) {
    if (error instanceof AuthException) throw error

    throw new DatabaseException("Problème de connexion au serveur.")
  }
}
  private translateError(message: string): string {
    if (message.includes("Token has expired")) return "Ce code a expiré. Veuillez en demander un nouveau."
    if (message.includes("Invalid login credentials")) return "Le code saisi est incorrect."
    return message
  }
}