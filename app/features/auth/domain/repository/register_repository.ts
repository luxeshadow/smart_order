import type { User } from '../entities/user'
import type { Failure } from '../../../../core/errors/failure'
import type { RegisterParam } from '../../application/params/register_params'

export interface RegisterRepository {
  register(param: RegisterParam): Promise<User | Failure>
}