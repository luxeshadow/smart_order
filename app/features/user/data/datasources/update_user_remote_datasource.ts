import { AuthException, DatabaseException } from '@/core/errors/exception'
import type { UpdateProfileParam } from '../../application/params/update_user_params'

export class UpdateProfileRemoteDatasource {
  constructor(private supabase: any) {}

  async updateProfile(param: UpdateProfileParam): Promise<void> {
    try {
      const normalizedEmail = param.email.trim().toLowerCase()
      const normalizedCurrentEmail =
        param.currentEmail.trim().toLowerCase()

      const emailChanged = normalizedEmail !== normalizedCurrentEmail

      if (emailChanged) {
        const { error: emailError } =
          await this.supabase.auth.updateUser({
            email: normalizedEmail
          })

        if (emailError) {
          throw new AuthException(
            this.translateError(emailError.message)
          )
        }
      }

      const { error: authMetaError } =
        await this.supabase.auth.updateUser({
          phone: param.phoneNumber,
          data: {
            username: param.userName
          }
        })

      if (authMetaError) {
        throw new AuthException(
          this.translateError(authMetaError.message)
        )
      }

      const { error: dbError } = await this.supabase
        .from('users')
        .update({
          username: param.userName,
          phone_number: param.phoneNumber
        })
        .eq('id', param.userId)

      if (dbError) {
        throw new DatabaseException(
          'Impossible de mettre à jour les informations en base.'
        )
      }
    } catch (error: any) {
      if (
        error instanceof AuthException ||
        error instanceof DatabaseException
      ) {
        throw error
      }

      throw new DatabaseException('Problème de connexion au serveur.')
    }
  }

  private translateError(message: string): string {
    const msg = message.toLowerCase()

    if (msg.includes('email address already exists')) {
      return 'Cette adresse email est déjà utilisée.'
    }

    if (msg.includes('phone already exists')) {
      return 'Ce numéro est déjà utilisé.'
    }

    return message
  }
}