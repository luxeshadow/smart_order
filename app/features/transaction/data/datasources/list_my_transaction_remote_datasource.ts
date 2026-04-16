import { DatabaseException } from '@/core/errors/exception'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'
import { MyTransactionModel } from '../models/my_transaction_model'

export class ListMyTransactionRemoteDatasource {
  constructor(private supabase: any) {}

  async getTransactions(
    param: ListMyTransactionParam
  ): Promise<MyTransactionModel[]> {
    try {
      const [wResponse, dResponse] = await Promise.all([
        this.supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', param.userId),

        this.supabase
          .from('deposits')
          .select('*')
          .eq('user_id', param.userId)
      ])

      if (wResponse.error) {
        throw new DatabaseException(wResponse.error.message)
      }

      if (dResponse.error) {
        throw new DatabaseException(dResponse.error.message)
      }

      const withdrawals = (wResponse.data || []).map((w: any) =>
        MyTransactionModel.fromSupabase(w, 'withdrawal')
      )

      const deposits = (dResponse.data || []).map((d: any) =>
        MyTransactionModel.fromSupabase(d, 'deposit')
      )

      return [...withdrawals, ...deposits]
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || 'Erreur lors de la récupération des transactions.'
      )
    }
  }
}