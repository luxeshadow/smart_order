import type { Failure } from '@/core/errors/failure'
import type { UserTransaction } from '../entities/user_transaction'

export interface ListWithdrawalRepository {
    getAllWithdrawals(): Promise< UserTransaction[]|Failure>
}