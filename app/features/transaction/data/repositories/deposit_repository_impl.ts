import { DepositRemoteDatasource } from '../datasources/deposit_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { DepositRepository } from '../../domain/repository/deposit_repository'
import type { Deposit} from '../../domain/entities/deposit'
import type { DepositParam } from '../../application/params/deposit_params'
import { useApi } from '@/core/constants/supabase_client'

export class DepositRepositoryImpl implements DepositRepository {
  private datasource: DepositRemoteDatasource

  constructor() {
    const supabase = useApi()
    
    this.datasource = new DepositRemoteDatasource(supabase)
  }

  async deposit(param: DepositParam): Promise<Deposit | DatabaseFailure> {
    try {

      const result = await this.datasource.deposit(param)
      return result

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors de l'enregistrement de votre dépôt."
      )
    }
  }
}