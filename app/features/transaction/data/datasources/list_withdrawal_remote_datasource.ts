import { DatabaseException } from '@/core/errors/exception'
import { UserTransactionModel } from '../models/user_transaction_model'

export class ListWithdrawalRemoteDatasource {
  constructor(private supabase: any) {}

  async getAllWithdrawals(): Promise<UserTransactionModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseException(error.message)
      }

      const withdrawals = (data || []).map((w: any) =>
        UserTransactionModel.fromSupabase(w, 'withdrawal')
      )

      return withdrawals
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message ||
          'Erreur lors de la récupération de la liste globale des retraits.'
      )
    }
  }
}