import { RegisterRemoteDatasource } from '../datasources/register_remote_datasource'
import { 
  AuthException, 
  DatabaseException, 
  UserAlreadyExistsException, 
  UserUnconfirmedException 
} from '@/core/errors/exception'
import { 
  AuthFailure, 
  DatabaseFailure, 
  UserUnconfirmedFailure, 
  Failure 
} from '@/core/errors/failure'
import type { RegisterRepository } from '../../domain/repository/register_repository'
import type { User } from '../../domain/entities/user'
import type { RegisterPayload } from '../../application/params/register_params'

import { useApi } from '@/core/constants/supabase_client'

export class RegisterRepositoryImpl implements RegisterRepository {
  private datasource: RegisterRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new RegisterRemoteDatasource(supabase)
  }

  async register(param: RegisterPayload): Promise<User | Failure> {
    try {
      const user = await this.datasource.register(param)
      return user

    } catch (error: any) {
      if (error instanceof UserUnconfirmedException) {
        return new UserUnconfirmedFailure(error.email)
      }

      if (error instanceof UserAlreadyExistsException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure(error.message || "Une erreur inattendue est survenue lors de l'enregistrement")
    }
  }
}