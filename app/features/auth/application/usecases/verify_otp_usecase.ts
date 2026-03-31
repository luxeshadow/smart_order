import type { UseCase } from '@/core/usecase/usecase'
import type { VerifyOtpRepository } from '../../domain/repository/verify_otp_repository'
import type { VerifyOtpParam } from '../params/verify_otp_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { VerifyOtpValidator } from '../../presentation/validators/verify_otp_validator'

export class VerifyOtpUseCase implements UseCase<void, VerifyOtpParam> {
  private repository: VerifyOtpRepository 

  constructor(repository: VerifyOtpRepository ) {
    this.repository = repository
  }

  async execute(param: VerifyOtpParam): Promise<void | Failure> {
    const validationError = VerifyOtpValidator.validate(param.otp)

    if (validationError) {
      return new AuthFailure(validationError)
    }

    const result = await this.repository.verifyOtp(param)
    
    return result
  }
}