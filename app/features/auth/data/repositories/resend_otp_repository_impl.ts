import { ResendOtpRemoteDatasource } from '../datasources/resend_otp_remote_datasource'
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { ResendOtpRepository } from '../../domain/repository/resend_otp_repository'
import type { ResendOtpParam } from '../../application/params/resend_otp_params'
import { useApi } from '@/core/constants/supabase_client'

export class ResendOtpRepositoryImpl implements ResendOtpRepository {
  private datasource: ResendOtpRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ResendOtpRemoteDatasource(supabase)
  }

  async resendOtp(param: ResendOtpParam): Promise<void | AuthFailure | DatabaseFailure> {
    try {
      await this.datasource.resendOtp(param)
      return
    } catch (error: any) {
      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors de la demande de renvoi du code."
      )
    }
  }
}