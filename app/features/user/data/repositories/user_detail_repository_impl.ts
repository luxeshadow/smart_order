import { UserDetailRemoteDatasource } from '../datasources/user_detail_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { Failure, DatabaseFailure } from '@/core/errors/failure' // Imports ici
import type { UserDetailRepository } from '../../domain/repository/user_detail_repository'
import type { UserDetail } from '../../domain/entities/user_detail'
import type { UserSearchParams } from '../../application/params/user_search_params'
import { useApi } from '@/core/constants/supabase_client'

export class UserDetailRepositoryImpl implements UserDetailRepository {
  private datasource: UserDetailRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new UserDetailRemoteDatasource(supabase)
  }

  async getUsersDetail(params: UserSearchParams): Promise<UserDetail[] | Failure> {
    try {
      const result = await this.datasource.fetchUsers(params)
      return result
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(error.message || "Erreur lors de la récupération")
    }
  }
}