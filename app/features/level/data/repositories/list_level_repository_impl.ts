import { ListLevelRemoteDatasource } from '../datasources/list_level_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListLevelRepository } from '../../domain/repository/list_level_repository'
import type { Level } from '../../domain/entities/level'
import { useApi } from '@/core/constants/supabase_client'

export class ListLevelRepositoryImpl implements ListLevelRepository {
  private datasource: ListLevelRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListLevelRemoteDatasource(supabase)
  }

  async listLevels(): Promise<Level[] | DatabaseFailure> {
    try {
      const levels = await this.datasource.listLevels()

      return levels

    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Impossible de charger la liste des niveaux."
      )
    }
  }
}