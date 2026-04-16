import type { UseCase } from '@/core/usecase/usecase'
import type { ShowMyPrincipalBalanceRepository} from '../../domain/repository/show_my_principal_balance_repository'
import type { ShowMyPrincipalBalanceParam } from '../params/show_my_principal_balance_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import type { UserBalanceParam } from '../params/user_balance_params'

export class ShowMyPrincipalBalanceUseCase implements UseCase<UserBalanceParam, ShowMyPrincipalBalanceParam> {
    
  private repository: ShowMyPrincipalBalanceRepository
  constructor(repository: ShowMyPrincipalBalanceRepository) {
    this.repository = repository
  }

  async execute(param: ShowMyPrincipalBalanceParam): Promise<UserBalanceParam | Failure> {

    if (!param.userId || param.userId.trim() === "") {
      return new AuthFailure("Identifiant utilisateur manquant.")
    }
    
    const result = await this.repository.getMyPrincipalBalance(param)
    
    return result
  }
}