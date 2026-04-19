import { UpdateWithdrawalRemoteDatasource } from '../datasources/update_withdrawal_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { Failure } from '@/core/errors/failure'
import type { UpdateWithdrawalRepository } from '../../domain/repository/update_withdrawal_repository'
import type { UpdateWithdrawalParam } from '../../application/params/update_withdrawal_params'
import { useApi } from '@/core/constants/supabase_client'

export class UpdateWithdrawalRepositoryImpl
  implements UpdateWithdrawalRepository
{
  private datasource: UpdateWithdrawalRemoteDatasource

  constructor() {
    this.datasource = new UpdateWithdrawalRemoteDatasource(useApi())
  }

  async updateWithdrawal(
    param: UpdateWithdrawalParam
  ): Promise<void | Failure> {
    try {
      await this.datasource.updateWithdrawal(param)
      return
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message ||
          'Erreur lors de la mise à jour du retrait.'
      )
    }
  }
}