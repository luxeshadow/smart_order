import { WalletRemoteDatasource } from '../datasources/create_wallet_remote_datasource'
import type { WalletRepository } from '../../domain/repository/wallet_repository'
import type { WalletConfigParam } from '../../application/params/wallet_params'
import type { Wallet } from '../../domain/entities/wallet'
import { useApi } from '@/core/constants/supabase_client'

export class WalletRepositoryImpl implements WalletRepository {
  private datasource: WalletRemoteDatasource

  constructor() {
    this.datasource = new WalletRemoteDatasource(useApi())
  }

  async createWallet(param: WalletConfigParam): Promise<Wallet> {
    return await this.datasource.createWallet(param)
  }
}