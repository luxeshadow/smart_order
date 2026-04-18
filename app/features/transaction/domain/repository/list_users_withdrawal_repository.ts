import type { Failure } from '@/core/errors/failure'
import type { Withdrawal } from '../entities/withdrawal'

export interface ListUsersWithdrawalRepository {
    getAllWithdrawals(): Promise< Withdrawal[]|Failure>
}