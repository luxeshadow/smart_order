import { DatabaseException } from '@/core/errors/exception'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'
import { MyTransactionModel } from '../models/my_transaction_model'

export class ListMyTransactionRemoteDatasource {
  constructor(private supabase: any) {}

  async getTransactions(
    param: ListMyTransactionParam
  ): Promise<MyTransactionModel[]> {
    try {
      const page = param.page || 1
      const pageSize = param.pageSize || 10

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const [wResponse, dResponse] = await Promise.all([
        this.supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', param.userId)
          .order('created_at', { ascending: false })
          .range(from, to),

        this.supabase
          .from('deposits')
          .select('*')
          .eq('user_id', param.userId)
          .order('created_at', { ascending: false })
          .range(from, to)
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

      const transactions = [
        ...withdrawals,
        ...deposits
      ]

      transactions.sort((a: any, b: any) => {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        )
      })

      return transactions.slice(0, pageSize)
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        throw error
      }

      throw new DatabaseException(
        error.message ||
          'Erreur lors de la récupération des transactions.'
      )
    }
  }
}