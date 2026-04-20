import type { UseCase } from '@/core/usecase/usecase';
import type { LevelSubscriberRepository } from '../../domain/repository/level_subscriber_repository';
import type { LevelSubscriber } from '../../domain/entities/level_subscibers';
import type { Failure } from '@/core/errors/failure';

export class GetLevelSubscribersUseCase implements UseCase<LevelSubscriber[], void> {
  constructor(private repository: LevelSubscriberRepository) {}

  async execute(): Promise<LevelSubscriber[] | Failure> {
    return await this.repository.getLevelSubscribersCount();
  }
}