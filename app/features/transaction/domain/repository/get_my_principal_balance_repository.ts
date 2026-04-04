import type { Failure } from '@/core/errors/failure'
import type { GetMyPrincipalBalanceParam } from '../../application/params/get_my_principal_balance_params'

export interface GetMyPrincipalBalanceRepository {
  getMyPrincipalBalance(param: GetMyPrincipalBalanceParam): Promise<number | Failure>
}