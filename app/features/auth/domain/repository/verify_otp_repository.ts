import type { VerifyOtpParam } from '../../application/params/verify_otp_params'
import { Failure } from '@/core/errors/failure'

export interface VerifyOtpRepository {

  verifyOtp(param: VerifyOtpParam): Promise<void | Failure>
}