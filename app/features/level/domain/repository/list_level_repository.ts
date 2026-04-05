import type { Failure } from '@/core/errors/failure'
import type { Level } from '../entities/level'

export interface ListLevelRepository {

  listLevels(): Promise<Level[] | Failure>;
}