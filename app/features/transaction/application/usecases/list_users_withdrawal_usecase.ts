import type { UseCase } from '@/core/usecase/usecase'
import type { ListUsersWithdrawalRepository } from '../../domain/repository/list_users_withdrawal_repository'
import type { ListUsersWithdrawalParam } from '../params/list_users_withdrawal_params'
import { Failure } from '@/core/errors/failure'
import type { UserWithdrawalGroupViewModel } from '../../presentation/viewmodels/users_withdrawal_view_model'

export interface PaginatedWithdrawals {
  data: UserWithdrawalGroupViewModel[]
  total: number
}

export class ListUsersWithdrawalUseCase
  implements UseCase<PaginatedWithdrawals, ListUsersWithdrawalParam>
{
  private repository: ListUsersWithdrawalRepository

  constructor(repository: ListUsersWithdrawalRepository) {
    this.repository = repository
  }

  async execute(
    param: ListUsersWithdrawalParam
  ): Promise<PaginatedWithdrawals | Failure> {

    const result = await this.repository.getAllWithdrawals(param)

    if (result instanceof Failure) {
      return result
    }

    // 🔥 IMPORTANT : retourner data + total
    return {
      data: result.data,
      total: result.total
    }
  }
}