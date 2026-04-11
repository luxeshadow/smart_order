import { WithdrawalRemoteDatasource } from '../datasources/withdrawal_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { WithdrawalRepository } from '../../domain/repository/withdrawal_repository'
import type { Withdrawal } from '../../domain/entities/withdrawal'
import type { WithdrawParam } from '../../application/params/withdrawal_params'
import { useApi } from '@/core/constants/supabase_client'

export class WithdrawalRepositoryImpl implements WithdrawalRepository {
  private datasource: WithdrawalRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new WithdrawalRemoteDatasource(supabase)
  }

  async withdrawal(param: WithdrawParam): Promise<Withdrawal | DatabaseFailure> {
    try {
      const result = await this.datasource.withdraw(param)
      return result
      
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors du traitement de votre retrait."
      )
    }
  }
}