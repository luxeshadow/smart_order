import { ListMyLevelRemoteDatasource } from '../datasources/list_my_level_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListMyLevelRepository } from '../../domain/repository/list_my_level_repository'
import type { Level } from '../../domain/entities/level' // Import de l'entité
import { useApi } from '@/core/constants/supabase_client'

export class ListMyLevelRepositoryImpl implements ListMyLevelRepository {
  private datasource: ListMyLevelRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListMyLevelRemoteDatasource(supabase)
  }

  async listMyLevels(userId: string): Promise<Level[] | DatabaseFailure> {
    try {
      const levels = await this.datasource.listMyLevels(userId)

      return levels.sort((a, b) => a.price - b.price);
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(error.message || "Erreur de récupération des niveaux.")
    }
  }
}