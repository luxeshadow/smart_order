import type { UseCase } from '@/core/usecase/usecase'
import type { ForgotPasswordRepository } from '../../domain/repository/forgot_password_repository'
import type { ForgotPasswordParam } from '../params/forgot_password_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { ForgotPasswordValidator } from '../../presentation/validators/forgot_password_validator'

export class ForgotPasswordUseCase implements UseCase<void, ForgotPasswordParam> {
  private repository: ForgotPasswordRepository

  constructor(repository: ForgotPasswordRepository) {
    this.repository = repository
  }

  async execute(param: ForgotPasswordParam): Promise<void | Failure> {
    // 1. Validation de l'email via ton validator
    const validationError = ForgotPasswordValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }

    // 2. Appel au repository pour l'envoi du lien via Supabase
    // Le lien généré pointera vers : https://mysmartorder.netlify.app/auth/reset-password
    const result = await this.repository.forgotPassword(param)
    
    return result
  }
}