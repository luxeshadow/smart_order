import { GetMyPrincipalBalanceRemoteDatasource } from '../datasources/get_my_principal_balance_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { GetMyPrincipalBalanceRepository } from '../../domain/repository/get_my_principal_balance_repository'
import type { GetMyPrincipalBalanceParam } from '../../application/params/get_my_principal_balance_params'
import type { UserBalanceParam } from '../../application/params/user_balance_params'
import { useApi } from '@/core/constants/supabase_client'

export class GetMyPrincipalBalanceRepositoryImpl implements GetMyPrincipalBalanceRepository {
  private datasource: GetMyPrincipalBalanceRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new GetMyPrincipalBalanceRemoteDatasource(supabase)
  }

  // 2. Mise à jour de la Promise : number -> UserBalances
  async getMyPrincipalBalance(
    param: GetMyPrincipalBalanceParam
  ): Promise< UserBalanceParam | DatabaseFailure> { 
    try {
      // balance contient maintenant l'objet { main, earnings, refund }
      const balances = await this.datasource.getMyPrincipalBalance(param)

      return balances

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Impossible de récupérer vos soldes actuels."
      )
    }
  }
}