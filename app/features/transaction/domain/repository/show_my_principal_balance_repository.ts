import type { Failure } from '@/core/errors/failure'
import type { ShowMyPrincipalBalanceParam } from '../../application/params/show_my_principal_balance_params'
import type { UserBalance } from '../entities/user_balance'

export interface ShowMyPrincipalBalanceRepository {
  getMyPrincipalBalance(param: ShowMyPrincipalBalanceParam): Promise<UserBalance | Failure>
}