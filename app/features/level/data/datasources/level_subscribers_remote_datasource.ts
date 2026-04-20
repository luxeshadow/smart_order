import { DatabaseException } from '@/core/errors/exception';
import { LevelSubscriberModel } from '../models/level_subscibers_model';

export class LevelSubscriberRemoteDatasource {
  constructor(private supabase: any) {}

  async getLevelSubscribersCount(): Promise<LevelSubscriberModel[]> {

    const { data, error } = await this.supabase
      .from('level_subscriber_stats')
      .select('*');

    if (error) {
      throw new DatabaseException(error.message);
    }

    return LevelSubscriberModel.fromSupabaseList(data || []);
  }
}