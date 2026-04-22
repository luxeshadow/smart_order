import type { UseCase } from '@/core/usecase/usecase'
import type { UpdateProfileRepository } from '../../domain/repository/update_user_repository'
import type { UpdateProfileParam } from '../params/update_user_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { UpdateProfileValidator } from '../../../auth/presentation/validators/update_profile_validator'

export class UpdateProfileUseCase implements UseCase<void, UpdateProfileParam> {
  private repository: UpdateProfileRepository

  constructor(repository: UpdateProfileRepository) {
    this.repository = repository
  }

  async execute(param: UpdateProfileParam): Promise<void | Failure> {

    const validationError = UpdateProfileValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }
    return await this.repository.updateProfile(param)
  }
}