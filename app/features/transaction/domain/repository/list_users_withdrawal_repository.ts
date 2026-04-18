import type { Failure } from '@/core/errors/failure'
import type { ListUsersWithdrawalParam } from '../../application/params/list_users_withdrawal_params'
import type { UserWithdrawalGroupViewModel } from '../../presentation/viewmodels/users_withdrawal_view_model'

export interface PaginatedWithdrawals {
  data: UserWithdrawalGroupViewModel[]
  total: number
}

export interface ListUsersWithdrawalRepository {
  getAllWithdrawals(
    param: ListUsersWithdrawalParam
  ): Promise<PaginatedWithdrawals | Failure>
}