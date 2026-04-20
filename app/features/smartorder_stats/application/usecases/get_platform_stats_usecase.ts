import type { UseCase } from '@/core/usecase/usecase';
import type { PlatformStatsRepository } from '../../domain/repository/platform_stats_repository';
import type { PlatformStats } from '../../domain/entities/platform_stats';
import type { Failure } from '@/core/errors/failure';

export class GetPlatformStatsUseCase implements UseCase<PlatformStats, void> {
  constructor(private repository: PlatformStatsRepository) {}

  async execute(): Promise<PlatformStats | Failure> {
    return await this.repository.getPlatformStats();
  }
}