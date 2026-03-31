import type { User } from '../entities/user'
import type { Failure } from '../../../../core/errors/failure'
import type { LoginParam } from '../../application/params/login_params'

export interface LoginRepository {
  login(param: LoginParam): Promise<User | Failure>
}