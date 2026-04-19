import type { Failure } from '@/core/errors/failure'
import type { UpdateWithdrawalParam } from '../../application/params/update_withdrawal_params'

export interface UpdateWithdrawalRepository {
  updateWithdrawal(param: UpdateWithdrawalParam): Promise<void | Failure>
}