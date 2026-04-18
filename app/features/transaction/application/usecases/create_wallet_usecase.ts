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
    const validationError = WalletValidator.validate({
      phoneNumber: param.paymentAddress,
      withdrawPassword: param.withdrawalPassword
    })

    if (validationError) {
      return new DatabaseFailure(validationError)
    }
    return await this.repository.createWallet(param)
  }
}