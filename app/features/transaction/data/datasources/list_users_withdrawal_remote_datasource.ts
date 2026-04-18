import { DatabaseException } from '@/core/errors/exception'
import type { ListUsersWithdrawalParam } from '../../application/params/list_users_withdrawal_params'

export class ListUsersWithdrawalRemoteDatasource {
  constructor(private supabase: any) {}

  async getAllWithdrawals(param: ListUsersWithdrawalParam): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_users_with_withdrawals',
        {
          p_page: param.page,
          p_limit: param.limit
        }
      )

      if (error) {
        throw new DatabaseException(error.message)
      }

      return data || { data: [], total: 0 }

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || 'Erreur chargement withdrawals'
      )
    }
  }
}