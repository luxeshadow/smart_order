import type { UseCase } from '@/core/usecase/usecase'
import type { LoginRepository } from '../../domain/repository/login_repository'
import type { LoginParam } from '../params/login_params'
import type { User } from '../../domain/entities/user'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { LoginValidator } from '../../presentation/validators/login_validator'

export class LoginUseCase implements UseCase<User, LoginParam> {
  private repository: LoginRepository

  constructor(repository: LoginRepository) {
    this.repository = repository
  }

  async execute(param: LoginParam): Promise<User | Failure> {
    const validationError = LoginValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }
    const result = await this.repository.login(param)
    
    return result
  }
}