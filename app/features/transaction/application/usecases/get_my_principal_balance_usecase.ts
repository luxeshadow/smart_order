import type { UseCase } from '@/core/usecase/usecase'
import type { GetMyPrincipalBalanceRepository} from '../../domain/repository/get_my_principal_balance_repository'
import type { GetMyPrincipalBalanceParam } from '../params/get_my_principal_balance_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import type { UserBalanceParam } from '../../application/params/user_balance_params'

export class GetMyPrincipalBalanceUseCase implements UseCase<UserBalanceParam, GetMyPrincipalBalanceParam> {
    
  private repository: GetMyPrincipalBalanceRepository
  constructor(repository: GetMyPrincipalBalanceRepository) {
    this.repository = repository
  }

  async execute(param: GetMyPrincipalBalanceParam): Promise<UserBalanceParam | Failure> {

    if (!param.userId || param.userId.trim() === "") {
      return new AuthFailure("Identifiant utilisateur manquant.")
    }
    
    const result = await this.repository.getMyPrincipalBalance(param)
    
    return result
  }
}