import type { UseCase } from '@/core/usecase/usecase'
import type { DepositRepository } from '../../domain/repository/create_deposit_repository'
import type { DepositParam } from '../params/deposit_params'
import type { Deposit } from '../../domain/entities/deposit'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { DepositValidator } from '../../presentation/validators/deposit_validator'

export class DepositUseCase implements UseCase<Deposit, DepositParam> {
  private repository: DepositRepository

  constructor(repository: DepositRepository) {
    this.repository = repository
  }

  async execute(param: DepositParam): Promise<Deposit | Failure> {
    const validationError = DepositValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }

    const result = await this.repository.deposit(param)
    
    return result
  }
}