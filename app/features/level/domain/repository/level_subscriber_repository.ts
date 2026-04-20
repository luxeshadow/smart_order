import type { LevelSubscriber } from '../entities/level_subscibers';
import type { Failure } from '@/core/errors/failure';

export interface LevelSubscriberRepository {
  getLevelSubscribersCount(): Promise<LevelSubscriber[] | Failure>;
}