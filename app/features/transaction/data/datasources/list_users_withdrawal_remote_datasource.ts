import { DatabaseException } from '@/core/errors/exception'
import { WithdrawalModel } from '../models/withdrawal_model'

export class ListUsersWithdrawalRemoteDatasource {
  constructor(private supabase: any) {}

  async getAllWithdrawals(): Promise<WithdrawalModel[]> {
    try {

      const { data, error } = await this.supabase
        .from('withdrawal_with_user_details') 
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseException(error.message)
      }
      return (data || []).map((w: any) =>
        WithdrawalModel.fromSupabase(w)
      )

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || 'Erreur lors de la récupération de la liste globale des retraits.'
      )
    }
  }
}