import { ListWithdrawalRemoteDatasource } from '../datasources/list_withdrawal_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListWithdrawalRepository } from '../../domain/repository/list_withdrawal_repository'
import type { Failure } from '@/core/errors/failure'
import type { UserTransaction } from '../../domain/entities/user_transaction'
import { useApi } from '@/core/constants/supabase_client'

export class ListWithdrawalRepositoryImpl implements ListWithdrawalRepository
{
  private datasource: ListWithdrawalRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListWithdrawalRemoteDatasource(supabase)
  }

  async getAllWithdrawals(): Promise<UserTransaction[] | Failure> {
    try {
      const withdrawals = await this.datasource.getAllWithdrawals()

      return withdrawals.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
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