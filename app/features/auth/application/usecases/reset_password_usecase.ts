import type { UseCase } from '@/core/usecase/usecase'
import type { ResetPasswordRepository } from '../../domain/repository/reset_password_repository'
import type { ResetPasswordParam } from '../params/reset_password_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { ResetPasswordValidator } from '../../presentation/validators/reset_password_validator'

export class ResetPasswordUseCase implements UseCase<any, ResetPasswordParam> {
  private repository: ResetPasswordRepository

  constructor(repository: ResetPasswordRepository) {
    this.repository = repository
  }

  async execute(param: ResetPasswordParam): Promise<any | Failure> {
    const validationError = ResetPasswordValidator.validate(param)
    if (validationError) {
      return new AuthFailure(validationError)
    }

    return await this.repository.resetPassword(param)
  }
}