import type { UseCase } from '@/core/usecase/usecase'
import type { WithdrawalRepository } from '../../domain/repository/create_withdrawal_repository'
import type { WithdrawParam } from '../params/withdrawal_params'
import type { Withdrawal } from '../../domain/entities/withdrawal'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { WithdrawalValidator } from '../../presentation/validators/withdrawal_validator'

export class WithdrawalUseCase implements UseCase<Withdrawal, WithdrawParam> {
  private repository: WithdrawalRepository

  constructor(repository: WithdrawalRepository) {
    this.repository = repository
  }

  async execute(param: WithdrawParam): Promise<Withdrawal | Failure> {
    const validationError = WithdrawalValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }
    const result = await this.repository.withdrawal(param)
    
    return result
  }
}