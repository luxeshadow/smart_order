import type { WalletConfigParam } from '../../application/params/wallet_params'
import { Failure } from '@/core/errors/failure'

export interface WalletRepository {
  
  createWallet(param: WalletConfigParam): Promise<void | Failure>
  
}