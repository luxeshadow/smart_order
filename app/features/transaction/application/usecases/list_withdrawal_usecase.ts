import type { UseCase } from '@/core/usecase/usecase'
import type { ListWithdrawalRepository } from '../../domain/repository/list_withdrawal_repository'
import type { UserTransaction } from '../../domain/entities/user_transaction'
import { Failure } from '@/core/errors/failure'

export class ListWithdrawalUseCase
  implements UseCase<UserTransaction[], void>
{
  private repository: ListWithdrawalRepository

  constructor(repository: ListWithdrawalRepository) {
    this.repository = repository
  }

  async execute(): Promise<UserTransaction[] | Failure> {
    const result = await this.repository.getAllWithdrawals()
    return result
  }
}