import type { SupabaseClient } from '@supabase/supabase-js'
import { WalletModel } from '../models/wallet_model'
import { DatabaseException } from '@/core/errors/exception'

export class WalletRemoteDatasource {
 
   constructor(private supabase: any) {}

  async upsertWallet(wallet: WalletModel): Promise<WalletModel> {
    const { data, error } = await this.supabase
      .from('wallets')
      .upsert(wallet.toSupabase(), { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw new DatabaseException(error.message)
    return WalletModel.fromSupabase(data)
  }
}