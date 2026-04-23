import type { UseCase } from '@/core/usecase/usecase'
import type { WalletRepository } from '../../domain/repository/wallet_repository'
import type { Wallet } from '../../domain/entities/wallet'
import { Failure, DatabaseFailure } from '@/core/errors/failure'
import { WalletValidator } from '../../presentation/validators/wallet_validator'

export class CreateWalletUseCase implements UseCase<Wallet, Wallet> {
  private repository: WalletRepository

  constructor(repository: WalletRepository) {
    this.repository = repository
  }

  async execute(param: Wallet): Promise<Wallet | Failure> {
    try {
      const validationError = WalletValidator.validate({
        phoneNumber: param.paymentAddress,
        withdrawPassword: param.withdrawalPassword
      })

      if (validationError) {
        return new DatabaseFailure(validationError)
      }

      const result = await this.repository.createWallet(param)
      if (!result) {
        return new DatabaseFailure('Erreur lors de la création du wallet')
      }

      return result

    } catch (error: any) {
      return new DatabaseFailure(
        error?.message || 'Erreur inconnue lors de la création du wallet'
      )
    }
  }
}