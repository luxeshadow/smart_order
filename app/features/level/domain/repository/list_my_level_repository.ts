import type { Failure } from '@/core/errors/failure'
import type { Level } from '../entities/level'

export interface ListMyLevelRepository {

  listMyLevels(userId: string): Promise<Level[] | Failure>;
}