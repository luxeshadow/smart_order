import { LoginRemoteDatasource } from '../datasources/login_remote_datasource'
import { AuthException, DatabaseException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
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
      // Appel à la datasource pour la logique brute Supabase
      const user = await this.datasource.login(param)
      
      // Retourne l'entité User en cas de succès
      return user

    } catch (error: any) {
      // 1. Erreur d'identifiants (Email/Phone ou Password incorrect)
      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      // 2. Erreur liée à la base de données ou au réseau
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      // 3. Fallback pour toute erreur inconnue
      return new DatabaseFailure(
        error.message || "Une erreur inattendue est survenue lors de la connexion."
      )
    }
  }
}