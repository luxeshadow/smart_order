import type { PlatformStats } from '../entities/platform_stats';
import type { Failure } from '@/core/errors/failure';

export interface PlatformStatsRepository {
  getPlatformStats(): Promise<PlatformStats | Failure>;
}