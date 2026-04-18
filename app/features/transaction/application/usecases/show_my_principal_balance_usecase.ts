import type { UseCase } from '@/core/usecase/usecase'
import type { ShowMyPrincipalBalanceRepository } from '../../domain/repository/show_my_principal_balance_repository'
import type { ShowMyPrincipalBalanceParam } from '../params/show_my_principal_balance_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import type { UserBalance } from '../../domain/entities/user_balance'

export class ShowMyPrincipalBalanceUseCase implements UseCase<UserBalance, ShowMyPrincipalBalanceParam>
{
  private repository: ShowMyPrincipalBalanceRepository

  constructor(repository: ShowMyPrincipalBalanceRepository) {
    this.repository = repository
  }

  async execute(param: ShowMyPrincipalBalanceParam): Promise<UserBalance | Failure> {

    if (!param.userId || param.userId.trim() === "") {
      return new AuthFailure("Identifiant utilisateur manquant.")
    }

    const result = await this.repository.getMyPrincipalBalance(param)

    return result
  }
}