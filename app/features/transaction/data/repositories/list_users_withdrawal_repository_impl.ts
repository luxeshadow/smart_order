import { ListUsersWithdrawalRemoteDatasource } from '../datasources/list_users_withdrawal_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListUsersWithdrawalRepository } from '../../domain/repository/list_users_withdrawal_repository'
import type { Failure } from '@/core/errors/failure'
import type { Withdrawal } from '../../domain/entities/withdrawal'
import { useApi } from '@/core/constants/supabase_client'

export class ListUsersWithdrawalRepositoryImpl implements ListUsersWithdrawalRepository {
  private datasource: ListUsersWithdrawalRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListUsersWithdrawalRemoteDatasource(supabase)
  }

  async getAllWithdrawals(): Promise<Withdrawal[] | Failure> {
    try {
      
      const withdrawals = await this.datasource.getAllWithdrawals()
      return withdrawals 
      
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(
        error.message || 'Erreur lors de la récupération de la liste globale des retraits.'
      )
    }
  }
}