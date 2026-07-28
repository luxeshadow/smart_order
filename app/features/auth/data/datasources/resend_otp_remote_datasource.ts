import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { ResendOtpParam } from '../../application/params/resend_otp_params'

export class ResendOtpRemoteDatasource {
  constructor(private supabase: any) {}

  async resendOtp(param: ResendOtpParam): Promise<void> {
    try {
      const email = param.email.trim().toLowerCase()

      const { error: authError } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (authError) {
        throw new AuthException(this.translateError(authError.message))
      }
    } catch (error: any) {
      if (error instanceof AuthException || error instanceof DatabaseException) {
        throw error
      }

      throw new DatabaseException("Problème de connexion au serveur.")
    }
  }

  private translateError(message: string): string {
    const msg = message.toLowerCase()
    if (msg.includes("rate limit exceeded") || msg.includes("email rate limit exceeded")) {
      return "Trop de demandes en peu de temps. Veuillez patienter un moment."
    }
    return message
  }
}