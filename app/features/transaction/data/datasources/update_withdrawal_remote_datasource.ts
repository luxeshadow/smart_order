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

    const { error } = await this.supabase
      .from('withdrawals')
      .update({ status: param.status })
      .eq('id', param.id)

    if (error) throw new DatabaseException(error.message)

    if (param.status === 'rejected' && existing.status !== 'rejected') {
      const { error: userError } = await this.supabase
        .from('users')
        .update({
          main_balance: Number(existing.amount) + Number(existing.main_balance || 0)
        })
        .eq('id', existing.user_id)

      if (userError) throw new DatabaseException(userError.message)
    }
  }
}