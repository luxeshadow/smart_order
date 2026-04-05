import { DatabaseException } from '@/core/errors/exception';
import { LevelModel } from '../models/level_model';

export class ListLevelRemoteDatasource {
  constructor(private supabase: any) {}

  async listLevels(): Promise<LevelModel[]> {
    const { data, error } = await this.supabase
      .from('levels')
      .select('*');

    if (error) {
      throw new DatabaseException(error.message);
    }

    return LevelModel.fromSupabaseList(data || []);
  }
}