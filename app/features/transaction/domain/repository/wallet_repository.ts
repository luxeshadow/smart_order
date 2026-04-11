import type { Wallet } from '../entities/wallet'
import type { WalletConfigParam } from '../../application/params/wallet_params'
import { Failure } from '@/core/errors/failure'

export interface WalletRepository {
  
  createWallet(param: WalletConfigParam): Promise<Wallet | Failure>
  getWalletByUserId(userId: string): Promise<Wallet | null | Failure>
}