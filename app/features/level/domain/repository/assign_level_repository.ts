import type { Failure } from '@/core/errors/failure'
import type { AssignLevelParam } from '../../application/params/assign_level_params'

export interface AssignLevelRepository {
  assignLevel(param: AssignLevelParam): Promise<number | Failure>
}