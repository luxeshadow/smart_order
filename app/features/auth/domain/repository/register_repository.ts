import type { User } from '../entities/user'
import type { Failure } from '../../../../core/errors/failure'
import type { RegisterPayload } from '../../application/params/register_params'

export interface RegisterRepository {
  register(param: RegisterPayload): Promise<User | Failure>
}