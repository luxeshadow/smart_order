import type { UseCase } from '@/core/usecase/usecase'
import type { DepositRepository } from '../../domain/repository/deposit_repository'
import type { DepositParam } from '../params/deposit_params'
import type { Deposit } from '../../domain/entities/deposit'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { DepositValidator } from '../../presentation/validators/deposit_validator'

export class DepositUseCase implements UseCase<Deposit, DepositParam> {
  private repository: DepositRepository

  constructor(repository: DepositRepository) {
    this.repository = repository
  }

  async execute(param: DepositParam): Promise<Deposit | Failure> {
    // 1. Validation des champs (Montant > 0, Numéro valide, etc.)
    const validationError = DepositValidator.validate(param)

    if (validationError) {
      // On utilise AuthFailure ou un nouveau DepositFailure selon tes besoins
      return new AuthFailure(validationError)
    }

    // 2. Appel au repository pour l'insertion en base de données
    const result = await this.repository.deposit(param)
    
    return result
  }
}