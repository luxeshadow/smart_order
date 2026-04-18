import { ShowMyPrincipalBalanceRemoteDatasource } from '../datasources/show_my_principal_balance_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ShowMyPrincipalBalanceRepository } from '../../domain/repository/show_my_principal_balance_repository'
import type { ShowMyPrincipalBalanceParam } from '../../application/params/show_my_principal_balance_params'
import { useApi } from '@/core/constants/supabase_client'
import { UserBalance } from '../../domain/entities/user_balance'

export class ShowMyPrincipalBalanceRepositoryImpl
  implements ShowMyPrincipalBalanceRepository
{
  private datasource: ShowMyPrincipalBalanceRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ShowMyPrincipalBalanceRemoteDatasource(supabase)
  }

  async getMyPrincipalBalance(
    param: ShowMyPrincipalBalanceParam
  ): Promise<UserBalance | DatabaseFailure> {
    try {
      const model = await this.datasource.getMyPrincipalBalance(param)
      return new UserBalance({
        main: model.main,
        earnings: model.earnings,
        refund: model.refund
      })

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