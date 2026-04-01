import { VerifyOtpRemoteDatasource } from '../datasources/verify_otp_remote_datasource'
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { VerifyOtpRepository } from '../../domain/repository/verify_otp_repository'
import type { VerifyOtpParam } from '../../application/params/verify_otp_params'
import { useApi } from '@/core/constants/supabase_client'

export class VerifyOtpRepositoryImpl implements VerifyOtpRepository {
  private datasource: VerifyOtpRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new VerifyOtpRemoteDatasource(supabase)
  }

  async verifyOtp(param: VerifyOtpParam): Promise<void | AuthFailure | DatabaseFailure> {
    try {
      await this.datasource.verifyOtp(param)
      return 
    } catch (error: any) {
      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors de la vérification du code"
      )
    }
  }
}