import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { ForgotPasswordParam } from '../../application/params/forgot_password_params'

export class ForgotPasswordRemoteDatasource {
   constructor(private supabase: any) {}

  async forgotPassword(param: ForgotPasswordParam): Promise<void> {
    try {
      const { error: authError } =
        await this.supabase.auth.resetPasswordForEmail(param.email, {
          redirectTo: 'https://mysmartorder.netlify.app/auth/reset-password',
        })

      if (authError) {
        throw new AuthException(this.translateError(authError.message))
      }
    } catch (error: any) {
      if (error instanceof AuthException) throw error

      throw new DatabaseException(
        error.message ||
          "Impossible d'envoyer le lien de récupération pour le moment."
      )
    }
  }

  private translateError(message: string): string {
    if (message.includes('rate limit')) {
      return 'Trop de tentatives. Veuillez réessayer plus tard.'
    }

    return message
  }
}