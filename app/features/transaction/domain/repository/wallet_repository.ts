import type { WalletConfigParam } from '../../application/params/wallet_params'
import type { Wallet } from '../entities/wallet'
import type { Failure } from '@/core/errors/failure'

export interface WalletRepository {
  createWallet(param: WalletConfigParam): Promise<Wallet | Failure>
}