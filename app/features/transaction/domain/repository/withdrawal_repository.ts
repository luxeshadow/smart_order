import type { Withdrawal } from '../entities/withdrawal'
import type { WithdrawParam } from '../../application/params/withdrawal_params'
import { Failure } from '@/core/errors/failure'

export interface WithdrawalRepository {

    withdrawal(param: WithdrawParam): Promise<Withdrawal| Failure>
}