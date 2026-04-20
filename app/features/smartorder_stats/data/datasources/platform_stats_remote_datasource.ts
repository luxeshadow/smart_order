import { DatabaseException } from '@/core/errors/exception'
import { PlatformStatsModel } from '../models/platform_stats_model'

export class PlatformStatsRemoteDatasource {
  constructor(private supabase: any) {}

  async getPlatformStats(): Promise<PlatformStatsModel> {
    try {
      const { data, error } = await this.supabase.rpc('get_platform_stats')

      if (error) throw new DatabaseException(error.message)
      const statsData = Array.isArray(data) ? data[0] : data

      if (!statsData) {
        throw new DatabaseException("Aucune donnée statistique trouvée")
      }

      return PlatformStatsModel.fromSupabase(statsData)
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(error.message || "Erreur lors de la récupération des stats")
    }
  }
}