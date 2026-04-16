import { ListMyTransactionRemoteDatasource } from '../datasources/list_my_transaction_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListMyTransactionRepository } from '../../domain/repository/list_my_transaction_repository'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'
import type { Failure } from '@/core/errors/failure'
import type { MyTransaction } from '../../domain/entities/my_transaction'
import { useApi } from '@/core/constants/supabase_client'

export class ListMyTransactionRepositoryImpl implements ListMyTransactionRepository
{
  private datasource: ListMyTransactionRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListMyTransactionRemoteDatasource(supabase)
  }

  async listMyTransaction(param: ListMyTransactionParam): Promise<MyTransaction[] | Failure> {
    try {
      const transactions = await this.datasource.getTransactions(param)

      return transactions.sort(
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
          "Erreur lors de la récupération de l'historique des transactions."
      )
    }
  }
}