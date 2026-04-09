import type { Failure } from '@/core/errors/failure'
import type { RefundToMainBalanceParam } from '../../application/params/refund_to_main_balance_params'

export interface RefundToMainBalanceRepository {
    refundToMainBalance (param: RefundToMainBalanceParam):Promise<void|Failure>
}