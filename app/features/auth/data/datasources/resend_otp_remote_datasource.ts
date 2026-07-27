import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { ResendOtpParam } from '../../application/params/resend_otp_params'

export class ResendOtpRemoteDatasource {
  constructor(private supabase: any) {}

  async resendOtp(param: ResendOtpParam): Promise<void> {
    try {
      const email = param.email.trim().toLowerCase()

      // 1. Contrôle du quota via la RPC Postgres (2 max / 24h)
      const { data: checkResult, error: rpcError } = await this.supabase.rpc(
        'check_and_log_otp_resend',
        { user_email: email }
      )

      if (rpcError) {
        throw new DatabaseException("Erreur lors de la vérification des quotas.")
      }

      if (checkResult && !checkResult.allowed) {
        throw new AuthException(
          checkResult.message || "Vous avez atteint la limite de 2 renvois par 24 heures."
        )
      }

      // 2. Renvoi effectif de l'OTP par e-mail
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

      console.error("[ResendOtpRemoteDatasource Error]:", error)
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