
import { ForgotPasswordRemoteDatasource } from '../datasources/forgot_password_remote_datasource'
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { ForgotPasswordRepository } from '../../domain/repository/forgot_password_repository'
import type { ForgotPasswordParam } from '../../application/params/forgot_password_params'
import { useApi } from '@/core/constants/supabase_client'
import type { Failure } from '@/core/errors/failure'

export class ForgotPasswordRepositoryImpl implements ForgotPasswordRepository {
  private datasource: ForgotPasswordRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ForgotPasswordRemoteDatasource(supabase)
  }

  async forgotPassword(param: ForgotPasswordParam): Promise<void | Failure> {
    try {
      await this.datasource.forgotPassword(param)
      return 
    } catch (error: any) {
      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors de l'envoi du lien de récupération"
      )
    }
  }
}