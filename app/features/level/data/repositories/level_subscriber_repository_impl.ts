import { LevelSubscriberRemoteDatasource } from '../datasources/level_subscribers_remote_datasource';
import { DatabaseException } from '@/core/errors/exception';
import { DatabaseFailure } from '@/core/errors/failure';
import type { LevelSubscriberRepository } from '../../domain/repository/level_subscriber_repository';
import type { LevelSubscriber } from '../../domain/entities/level_subscibers';
import { useApi } from '@/core/constants/supabase_client';

export class LevelSubscriberRepositoryImpl implements LevelSubscriberRepository {
  private datasource: LevelSubscriberRemoteDatasource;

  constructor() {
    this.datasource = new LevelSubscriberRemoteDatasource(useApi());
  }

  async getLevelSubscribersCount(): Promise<LevelSubscriber[] | DatabaseFailure> {
    try {
      const result = await this.datasource.getLevelSubscribersCount();
      return result;
    } catch (error: any) {
      return new DatabaseFailure(
        error instanceof DatabaseException ? error.message : "Erreur de récupération des statistiques."
      );
    }
  }
}