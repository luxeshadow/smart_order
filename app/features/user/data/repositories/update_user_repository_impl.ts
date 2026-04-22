import { UpdateProfileRemoteDatasource } from '../datasources/update_user_remote_datasource' 
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { UpdateProfileRepository } from '../../domain/repository/update_user_repository'
import type { UpdateProfileParam } from '../../application/params/update_user_params'
import { useApi } from '@/core/constants/supabase_client'

export class UpdateProfileRepositoryImpl implements UpdateProfileRepository {
  private datasource: UpdateProfileRemoteDatasource

  constructor() {
    const supabase = useApi()
    // On initialise la bonne datasource ici
    this.datasource = new UpdateProfileRemoteDatasource(supabase)
  }

  async updateProfile(param: UpdateProfileParam): Promise<void | AuthFailure | DatabaseFailure> {
    try {
      await this.datasource.updateProfile(param)
      return 
    } catch (error: any) {
      if (error instanceof AuthException) return new AuthFailure(error.message)
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      
      return new DatabaseFailure(error.message || 'Erreur lors de la mise à jour')
    }
  }
}