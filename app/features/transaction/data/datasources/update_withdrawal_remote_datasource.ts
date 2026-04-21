import { DatabaseException } from '@/core/errors/exception'
import type { UpdateWithdrawalParam } from '../../application/params/update_withdrawal_params'

export class UpdateWithdrawalRemoteDatasource {
  constructor(private supabase: any) {}

  async updateWithdrawal(param: UpdateWithdrawalParam): Promise<void> {
    const { data: existing, error: fetchError } = await this.supabase
      .from('withdrawals')
      .select('user_id, amount, status')
      .eq('id', param.id)
      .single()

    if (fetchError) throw new DatabaseException(fetchError.message)
    if (!existing) throw new DatabaseException('Withdrawal introuvable')

    // 🔥 update status
    const { error } = await this.supabase
      .from('withdrawals')
      .update({ status: param.status })
      .eq('id', param.id)

    if (error) throw new DatabaseException(error.message)

    // 🔥 si rejet → rembourser
    if (param.status === 'rejected' && existing.status !== 'rejected') {

      // 👉 récupérer le vrai solde actuel
      const { data: user, error: userFetchError } = await this.supabase
        .from('users')
        .select('main_balance')
        .eq('id', existing.user_id)
        .single()

      if (userFetchError) throw new DatabaseException(userFetchError.message)

      const newBalance =
        Number(user.main_balance || 0) + Number(existing.amount)

      const { error: userError } = await this.supabase
        .from('users')
        .update({
          main_balance: newBalance
        })
        .eq('id', existing.user_id)

      if (userError) throw new DatabaseException(userError.message)
    }
  }
}