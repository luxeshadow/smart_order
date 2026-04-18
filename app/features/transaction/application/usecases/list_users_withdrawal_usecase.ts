import type { UseCase } from '@/core/usecase/usecase'
import type { ListUsersWithdrawalRepository } from '../../domain/repository/list_users_withdrawal_repository'
import type { UserWithdrawalGroupViewModel } from '../../presentation/viewmodels/users_withdrawal_view_model'
import { Failure } from '@/core/errors/failure'
import { UserWithdrawalMapper } from '../mappers/users_withdrawal_mapper'

export class ListUsersWithdrawalUseCase implements UseCase<UserWithdrawalGroupViewModel[], void>
{
  private repository: ListUsersWithdrawalRepository

  constructor(repository: ListUsersWithdrawalRepository) {
    this.repository = repository
  }
  async execute(): Promise<UserWithdrawalGroupViewModel[] | Failure> {
    const result = await this.repository.getAllWithdrawals()

    if (result instanceof Failure) {
      return result
    }
    return UserWithdrawalMapper.toViewModel(result)
  }
}