import { WalletRemoteDatasource } from '../datasources/create_wallet_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { WalletRepository } from '../../domain/repository/wallet_repository'
import type { Wallet } from '../../domain/entities/wallet'
import { WalletModel } from '../models/wallet_model'
import { useApi } from '@/core/constants/supabase_client'

export class WalletRepositoryImpl implements WalletRepository {
  private datasource: WalletRemoteDatasource

  constructor() {
    this.datasource = new WalletRemoteDatasource(useApi())
  }

  async createWallet(wallet: Wallet): Promise<Wallet | DatabaseFailure> {
    try {
      const model = new WalletModel(wallet)
      return await this.datasource.upsertWallet(model)
    } catch (error: any) {
      return new DatabaseFailure(error.message || "Erreur lors de l'enregistrement du wallet.")
    }
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null | DatabaseFailure> {
   
     return null 
  }
}