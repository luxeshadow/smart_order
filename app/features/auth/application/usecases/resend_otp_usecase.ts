import type { UseCase } from '@/core/usecase/usecase'
import type { ResendOtpRepository } from '../../domain/repository/resend_otp_repository'
import type { ResendOtpParam } from '../params/resend_otp_params'
import { Failure, AuthFailure } from '@/core/errors/failure'

export class ResendOtpUseCase implements UseCase<void, ResendOtpParam> {
  private repository: ResendOtpRepository

  constructor(repository: ResendOtpRepository) {
    this.repository = repository
  }

  async execute(param: ResendOtpParam): Promise<void | Failure> {
    if (!param.email || !param.email.trim()) {
      return new AuthFailure("L'adresse e-mail est requise pour renvoyer le code.")
    }

    const result = await this.repository.resendOtp(param)
    return result
  }
}