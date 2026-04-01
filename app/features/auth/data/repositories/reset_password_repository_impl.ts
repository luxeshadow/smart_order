
import { ResetPasswordRemoteDatasource } from '../datasources/reset_password_remote_datasource'
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { ResetPasswordRepository } from '../../domain/repository/reset_password_repository'
import type { ResetPasswordParam } from '../../application/params/reset_password_params'
import { useApi } from '@/core/constants/supabase_client'
import type { Failure } from '@/core/errors/failure'

export class ResetPasswordRepositoryImpl implements ResetPasswordRepository {
  private datasource: ResetPasswordRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ResetPasswordRemoteDatasource(supabase)
  }

  async resetPassword(param: ResetPasswordParam): Promise<any | Failure> {
    try {
      await this.datasource.resetPassword(param)
      return true // On retourne true pour confirmer le succès
    } catch (error: any) {
      if (error instanceof AuthException) return new AuthFailure(error.message)
      return new DatabaseFailure(error.message || "Erreur de mise à jour")
    }
  }
}