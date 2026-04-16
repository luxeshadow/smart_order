import type { Failure } from '@/core/errors/failure'
import type { ShowMyPrincipalBalanceParam } from '../../application/params/show_my_principal_balance_params'
import type { UserBalanceParam } from '../../application/params/user_balance_params'

export interface ShowMyPrincipalBalanceRepository {
  getMyPrincipalBalance(param: ShowMyPrincipalBalanceParam): Promise<UserBalanceParam | Failure>
}