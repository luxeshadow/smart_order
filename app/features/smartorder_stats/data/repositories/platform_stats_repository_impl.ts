import { PlatformStatsRemoteDatasource } from '../datasources/platform_stats_remote_datasource';
import { DatabaseException } from '@/core/errors/exception';
import { DatabaseFailure } from '@/core/errors/failure';
import type { PlatformStatsRepository } from '../../domain/repository/platform_stats_repository';
import type { PlatformStats } from '../../domain/entities/platform_stats';
import { useApi } from '@/core/constants/supabase_client';

export class PlatformStatsRepositoryImpl implements PlatformStatsRepository {
  private datasource: PlatformStatsRemoteDatasource;

  constructor() {
    const supabase = useApi();
 
    this.datasource = new PlatformStatsRemoteDatasource(supabase);
  }

  async getPlatformStats(): Promise<PlatformStats | DatabaseFailure> {
    try {
      const stats = await this.datasource.getPlatformStats();
      return stats;
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message);
      }
      return new DatabaseFailure(
        error.message || "Une erreur inattendue est survenue lors de la récupération des statistiques."
      );
    }
  }
}