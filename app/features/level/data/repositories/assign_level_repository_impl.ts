import { AssignLevelRemoteDatasource } from '../datasources/assign_level_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { AssignLevelRepository } from '../../domain/repository/assign_level_repository'
import type { AssignLevelParam } from '../../application/params/assign_level_params'
import { useApi } from '@/core/constants/supabase_client'

export class AssignLevelRepositoryImpl implements AssignLevelRepository {
  private datasource: AssignLevelRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new AssignLevelRemoteDatasource(supabase)
  }

  async assignLevel(param: AssignLevelParam): Promise<number | DatabaseFailure> {
    try {
      const newBalance = await this.datasource.assignLevel(param)
    
      return newBalance

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Une erreur inattendue est survenue lors de l'activation."
      )
    }
  }
}