import { GetMyPrincipalBalanceRemoteDatasource } from '../datasources/get_my_principal_balance_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { GetMyPrincipalBalanceRepository } from '../../domain/repository/get_my_principal_balance_repository'
import type { GetMyPrincipalBalanceParam } from '../../application/params/get_my_principal_balance_params'
import { useApi } from '@/core/constants/supabase_client'

export class GetMyPrincipalBalanceRepositoryImpl implements GetMyPrincipalBalanceRepository {
  private datasource: GetMyPrincipalBalanceRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new GetMyPrincipalBalanceRemoteDatasource(supabase)
  }

  async getMyPrincipalBalance(param: GetMyPrincipalBalanceParam): Promise<number | DatabaseFailure> {
    try {
      const balance = await this.datasource.getMyPrincipalBalance(param)

      return balance

    } catch (error: any) {

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Impossible de récupérer votre solde actuel."
      )
    }
  }
}