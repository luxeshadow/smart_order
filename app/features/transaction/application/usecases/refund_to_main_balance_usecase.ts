import type { Failure } from '@/core/errors/failure'
import type { RefundToMainBalanceRepository } from '../../domain/repository/refund_to_main_balance_repository'
import type { RefundToMainBalanceParam } from '../../application/params/refund_to_main_balance_params'

export class RefundToMainBalanceUseCase {
  private repository: RefundToMainBalanceRepository

  constructor(repository: RefundToMainBalanceRepository) {
    this.repository = repository
  }

  /**
   * Exécute la logique métier de transfert du solde "Refund" vers le solde "Main".
   * * @param param Contient l'ID de l'utilisateur
   * @returns void en cas de succès, ou une Failure contenant le message d'erreur
   */
  async execute(param: RefundToMainBalanceParam): Promise<void | Failure> {
    // On délègue l'opération au repository
    return await this.repository.refundToMainBalance(param)
  }
}