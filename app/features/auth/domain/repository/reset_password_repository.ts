import type { User } from '../entities/user'
import type { Failure } from '../../../../core/errors/failure'
import type { ResetPasswordParam } from '../../application/params/reset_password_params'

export interface ResetPasswordRepository {
    resetPassword (param:ResetPasswordParam): Promise<User|Failure>
}