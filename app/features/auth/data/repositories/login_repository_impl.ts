import { LoginRemoteDatasource } from '../datasources/login_remote_datasource'
import { AuthException, DatabaseException, UserUnconfirmedException } from '@/core/errors/exception'
import { AuthFailure,UserUnconfirmedFailure , DatabaseFailure } from '@/core/errors/failure'
import type { LoginRepository } from '../../domain/repository/login_repository'
import type { User } from '../../domain/entities/user'
import type { LoginParam } from '../../application/params/login_params'
import { useApi } from '@/core/constants/supabase_client'


export class LoginRepositoryImpl implements LoginRepository {
  private datasource: LoginRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new LoginRemoteDatasource(supabase)
  }

  async login(param: LoginParam): Promise<User | AuthFailure | DatabaseFailure> {
    try {
      const user = await this.datasource.login(param)
      return user
    } catch (error: any) {
      if (error instanceof UserUnconfirmedException) {
        return new UserUnconfirmedFailure(error.email)
      }

      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(
        error.message || "Une erreur inattendue est survenue lors de la connexion."
      )
    }
  }
}