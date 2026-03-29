import type { UseCase } from '@/core/usecase/usecase' // Import du contrat
import type { RegisterRepository } from '../../domain/repository/register_repository'
import type { RegisterParam } from '../params/register_params'
import type { User } from '../../domain/entities/user'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { RegisterValidator } from '../../presentation/validators/register_validator'

export class RegisterUseCase implements UseCase<User, RegisterParam> {
  
  private repository: RegisterRepository

  constructor(repository: RegisterRepository) {
    this.repository = repository
  }

  async execute(param: RegisterParam): Promise<User | Failure> {
    
    const validationError = RegisterValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }

    const result = await this.repository.register(param)
    
    return result
  }
}