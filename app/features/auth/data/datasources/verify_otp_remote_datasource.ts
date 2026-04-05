import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { VerifyOtpParam } from '../../application/params/verify_otp_params'

export type OtpVerificationType = 'signup' | 'email_change' | 'recovery' | 'invite' | 'magiclink';

export class VerifyOtpRemoteDatasource {
   constructor(private supabase: any) {}

  async verifyOtp(param: VerifyOtpParam, type: OtpVerificationType = 'signup'): Promise<void> {
    try {
      const { data, error: authError } = await this.supabase.auth.verifyOtp({
        email: param.email,
        token: param.otp,
        type: type 
      })

      if (authError) {
        throw new AuthException(this.translateError(authError.message))
      }

      if (!data.user) {
        throw new AuthException("Session utilisateur introuvable.")
      }

    } catch (error: any) {
      if (error instanceof AuthException) throw error
      
      // On log l'erreur réelle en console pour le debug si besoin
      console.error("[VerifyOtpRemoteDatasource Error]:", error)
      throw new DatabaseException("Problème de connexion au serveur.")
    }
  }

  private translateError(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes("token has expired")) return "Ce code a expiré. Veuillez en demander un nouveau."
    if (msg.includes("invalid login credentials") || msg.includes("otp lookup failed")) {
      return "Le code saisi est incorrect."
    }
    return message
  }
}