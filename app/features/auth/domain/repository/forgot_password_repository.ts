
import type { Failure } from '../../../../core/errors/failure'
import type { ForgotPasswordParam } from '../../application/params/forgot_password_params'

export interface ForgotPasswordRepository {
    forgotPassword (param:ForgotPasswordParam): Promise <void|Failure>
}
