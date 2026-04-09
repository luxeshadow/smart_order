import { ListMyTransactionRemoteDatasource } from '../datasources/list_my_transaction_remote_datasource'
import { UserTransactionModel } from '../models/user_transaction_model' // Import du model
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListMyTransactionRepository } from '../../domain/repository/list_my_transaction_repository'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'
import type { Failure } from '@/core/errors/failure'
import type { UserTransaction } from '../../domain/entities/user_transaction'
import { useApi } from '@/core/constants/supabase_client'

export class ListMyTransactionRepositoryImpl implements ListMyTransactionRepository {
  private datasource: ListMyTransactionRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListMyTransactionRemoteDatasource(supabase)
  }

  async listMyTransaction(param: ListMyTransactionParam): Promise<UserTransaction[] | Failure> {
    try {
      const { withdrawals, deposits } = await this.datasource.getRawTransactions(param)

      const mappedWithdrawals = withdrawals.map((w) => 
        UserTransactionModel.fromSupabase(w, 'withdrawal')
      )
      const mappedDeposits = deposits.map((d) => 
        UserTransactionModel.fromSupabase(d, 'deposit')
      )

      const allTransactions = [...mappedWithdrawals, ...mappedDeposits]

      allTransactions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

      return allTransactions

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Erreur lors de la récupération de l'historique des transactions."
      )
    }
  }
}