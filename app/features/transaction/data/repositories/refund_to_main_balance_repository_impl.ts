import { RefundToMainBalanceRemoteDatasource } from '../datasources/refund_to_main_balance_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { RefundToMainBalanceRepository } from '../../domain/repository/refund_to_main_balance_repository'
import type { RefundToMainBalanceParam } from '../../application/params/refund_to_main_balance_params'
import type { Failure } from '@/core/errors/failure'
import { useApi } from '@/core/constants/supabase_client'

export class RefundToMainBalanceRepositoryImpl implements RefundToMainBalanceRepository {
  private datasource: RefundToMainBalanceRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new RefundToMainBalanceRemoteDatasource(supabase)
  }

  async refundToMainBalance(param: RefundToMainBalanceParam): Promise<void | Failure> {
    try {
      // On appelle la datasource
      await this.datasource.refundToMainBalance(param)
      
      // Succès
      return;

    } catch (error: any) {
      // Gestion des erreurs via tes classes de Failure
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Erreur lors du transfert du solde."
      )
    }
  }
}