import type { Wallet } from '../entities/wallet'
import { Failure } from '@/core/errors/failure'

export interface WalletRepository {
  
   createWallet(wallet: Wallet): Promise<Wallet | Failure>
  getWalletByUserId(userId: string): Promise<Wallet | null | Failure>
}