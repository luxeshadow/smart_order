import type { Failure } from '@/core/errors/failure'
import type { UserWithdrawal } from '../entities/users_withdrawal'

export interface ListUsersWithdrawalRepository {
    getAllWithdrawals(): Promise< UserWithdrawal[]|Failure>
}