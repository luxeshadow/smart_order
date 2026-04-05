import { DatabaseException } from '@/core/errors/exception';
import { LevelModel } from '../models/level_model';

export class ListMyLevelRemoteDatasource {
  constructor(private supabase: any) {}

  async listMyLevels(userId: string): Promise<LevelModel[]> {
    const { data, error } = await this.supabase
      .from('users_levels')
      .select(`
        levels (*)
      `)
      .eq('user_id', userId);

    if (error) throw new DatabaseException(error.message);

    const rawData = (data || []).map((item: any) => item.levels);
    return LevelModel.fromSupabaseList(rawData);
  }
}