import { ListUsersWithdrawalRemoteDatasource } from '../datasources/list_users_withdrawal_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListUsersWithdrawalRepository } from '../../domain/repository/list_users_withdrawal_repository'
import type { Failure } from '@/core/errors/failure'
import type { ListUsersWithdrawalParam } from '../../application/params/list_users_withdrawal_params'
import { useApi } from '@/core/constants/supabase_client'

export type PaginatedWithdrawals = {
  data: any[]
  total: number
}

export class ListUsersWithdrawalRepositoryImpl
  implements ListUsersWithdrawalRepository
{
  private datasource: ListUsersWithdrawalRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListUsersWithdrawalRemoteDatasource(supabase)
  }

  async getAllWithdrawals(param: ListUsersWithdrawalParam): Promise<PaginatedWithdrawals | Failure> {
    try {
      const response = await this.datasource.getAllWithdrawals(param)
      return {
        data: response.data || [],
        total: response.total || 0
      }

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message ||
          'Erreur lors de la récupération de la liste globale des retraits.'
      )
    }
  }
}