
import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { ResetPasswordParam } from '../../application/params/reset_password_params'

export class ResetPasswordRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async resetPassword(param: ResetPasswordParam): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: param.password
      })

      if (error) {
        throw new AuthException(this.translateError(error.message))
      }
    } catch (error: any) {
      if (error instanceof AuthException) throw error
      throw new DatabaseException("Impossible de mettre à jour le mot de passe.")
    }
  }

  private translateError(message: string): string {
    if (message.includes("same as old")) return "Le nouveau mot de passe doit être différent de l'ancien."
    return "Une erreur est survenue lors de la mise à jour."
  }
}