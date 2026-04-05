import type { UseCase } from '@/core/usecase/usecase'
import type { AssignLevelRepository } from '../../domain/repository/assign_level_repository'
import type { AssignLevelParam } from '../params/assign_level_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { AssignLevelValidator } from '../../presentation/validators/assign_level_validator'


export class AssignLevelUseCase implements UseCase<number, AssignLevelParam> {
  private repository: AssignLevelRepository

  constructor(repository: AssignLevelRepository) {
    this.repository = repository
  }

  async execute(param: AssignLevelParam): Promise<number | Failure> {
    const validationError = AssignLevelValidator.validate(param)
    
    if (validationError) {
      return new AuthFailure(validationError)
    }
    return await this.repository.assignLevel(param)
  }
}