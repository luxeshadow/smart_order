import type { UseCase } from '@/core/usecase/usecase'
import type { ListMyLevelRepository } from '../../domain/repository/list_my_level_repository'
import type { Level } from '../../domain/entities/level'
import { Failure } from '@/core/errors/failure'

export class ListMyLevelUseCase implements UseCase<Level[], string> {
  private repository: ListMyLevelRepository

  constructor(repository: ListMyLevelRepository) {
    this.repository = repository
  }

  async execute(userId: string): Promise<Level[] | Failure> {
    return await this.repository.listMyLevels(userId)
  }
}