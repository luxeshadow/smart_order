import type { UseCase } from '@/core/usecase/usecase'
import type { ListMyTransactionRepository } from '../../domain/repository/list_my_transaction_repository'
import type { ListMyTransactionParam } from '../params/list_my_transaction_params'
import type { MyTransaction } from '../../domain/entities/my_transaction'
import { Failure, AuthFailure } from '@/core/errors/failure'

export class ListMyTransactionUseCase implements UseCase<MyTransaction[], ListMyTransactionParam> {
  private repository: ListMyTransactionRepository
  constructor(repository: ListMyTransactionRepository) {
    this.repository = repository
  }
  async execute(param: ListMyTransactionParam): Promise<MyTransaction[] | Failure> {
    if (!param.userId || param.userId.trim() === "") {
      return new AuthFailure(
        "Identifiant utilisateur manquant pour récupérer l'historique."
      )
    }
    const result = await this.repository.listMyTransaction(param)
    if (result instanceof Array) {
      return result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    }
    return result
  }
}