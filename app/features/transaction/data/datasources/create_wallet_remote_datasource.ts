import { WalletModel } from '../models/wallet_model'
import type { WalletConfigParam } from '../../application/params/wallet_params'

export class WalletRemoteDatasource {
  constructor(private supabase: any) {}

  async createWallet(param: WalletConfigParam): Promise<WalletModel> {
    const { data, error } = await this.supabase
      .from('wallets')
      .upsert(
        {
          user_id: param.userId,
          withdrawal_password: param.withdrawalPassword,
          payment_address: param.paymentAddress
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return WalletModel.fromSupabase(data)
  }
}