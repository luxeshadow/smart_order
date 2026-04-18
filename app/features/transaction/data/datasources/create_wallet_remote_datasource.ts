import { DatabaseException } from '@/core/errors/exception'
import type { WalletConfigParam } from '../../application/params/wallet_params'

export class WalletRemoteDatasource {
  constructor(private supabase: any) {}

  async upsertWallet(param: WalletConfigParam): Promise<void> {
    const { error } = await this.supabase
      .from('wallets')
      .upsert(
        {
          user_id: param.userId,
          withdrawal_password: param.withdrawalPassword,
          payment_address: param.paymentAddress
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      throw new DatabaseException(error.message)
    }
  }
}