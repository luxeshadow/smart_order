import { WalletRemoteDatasource } from '../datasources/create_wallet_remote_datasource'
import { DatabaseFailure } from '@/core/errors/failure'
import type { WalletRepository } from '../../domain/repository/wallet_repository'
import type { Wallet } from '../../domain/entities/wallet'
import type { WalletConfigParam } from '../../application/params/wallet_params'
import { useApi } from '@/core/constants/supabase_client'

export class WalletRepositoryImpl implements WalletRepository {
  private datasource: WalletRemoteDatasource

  constructor() {
    this.datasource = new WalletRemoteDatasource(useApi())
  }

  async createWallet(param: WalletConfigParam): Promise<Wallet | DatabaseFailure> {
    try {
      return await this.datasource.createWallet(param)
    } catch (error: any) {
      return new DatabaseFailure(
        error.message || "Erreur lors de l'enregistrement du wallet."
      )
    }
  }


}