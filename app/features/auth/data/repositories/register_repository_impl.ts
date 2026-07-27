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
      // 1. Cas spécifique : Compte existant non confirmé / inactif
      if (error instanceof UserUnconfirmedException) {
        return new UserUnconfirmedFailure(error.email)
      }

      // 2. Utilisateur déjà existant (et actif)
      if (error instanceof UserAlreadyExistsException) {
        return new AuthFailure(error.message)
      }

      // 3. Erreurs d'authentification
      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      // 4. Erreurs de base de données
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      // 5. Fallback d'erreur inattendue
      return new DatabaseFailure(error.message || "Une erreur inattendue est survenue lors de l'enregistrement")
    }
  }
}