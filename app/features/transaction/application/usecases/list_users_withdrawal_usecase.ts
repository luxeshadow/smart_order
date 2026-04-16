import type { UseCase } from '@/core/usecase/usecase'
import type { ListUsersWithdrawalRepository } from '../../domain/repository/list_users_withdrawal_repository'
import type { UserWithdrawal } from '../../domain/entities/users_withdrawal'
import { Failure } from '@/core/errors/failure'

export class ListUsersWithdrawalUseCase
  implements UseCase<UserWithdrawal[], void>
{
  private repository: ListUsersWithdrawalRepository

  constructor(repository: ListUsersWithdrawalRepository) {
    this.repository = repository
  }

  async execute(): Promise<UserWithdrawal[] | Failure> {
    const result = await this.repository.getAllWithdrawals()
    return result
  }
}