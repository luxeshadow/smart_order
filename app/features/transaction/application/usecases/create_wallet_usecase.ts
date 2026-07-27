import type { UseCase } from '@/core/usecase/usecase'
import type { WalletRepository } from '../../domain/repository/wallet_repository'
import type { Wallet } from '../../domain/entities/wallet'
import type { WalletConfigParam } from '../params/wallet_params'
import { Failure, DatabaseFailure,ValidatorFailure } from '@/core/errors/failure'
import { WalletValidator } from '../../presentation/validators/wallet_validator'

export class CreateWalletUseCase implements UseCase<Wallet, WalletConfigParam> {
  constructor(private repository: WalletRepository) {}

  async execute(param: WalletConfigParam): Promise<Wallet | Failure> {

    const validationError = WalletValidator.validate(param)

    if (validationError) {
      return new ValidatorFailure(validationError)
    }

    try {
      return await this.repository.createWallet(param)
    } catch (error: any) {
      return new DatabaseFailure(
        error?.message || 'Erreur inconnue lors de la création du wallet'
      )
    }
  }
}