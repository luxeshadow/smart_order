import type { UseCase } from '@/core/usecase/usecase'
import type { ListLevelRepository } from '../../domain/repository/list_level_repository'
import type { Level } from '../../domain/entities/level'
import { Failure } from '@/core/errors/failure'


export class ListLevelUseCase implements UseCase<Level[], void> {
  private repository: ListLevelRepository

  constructor(repository: ListLevelRepository) {
    this.repository = repository
  }

  async execute(): Promise<Level[] | Failure> {
    return await this.repository.listLevels()
  }
}