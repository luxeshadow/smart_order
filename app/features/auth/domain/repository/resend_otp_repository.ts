import type { Failure } from '../../../../core/errors/failure'
import type { ResendOtpParam } from '../../application/params/resend_otp_params'

export interface ResendOtpRepository {  
    resendOtp(param: ResendOtpParam ): Promise <void | Failure>
}