import { RegisterRemoteDatasource } from '../datasources/register_remote_datasource'
import { AuthException, DatabaseException, UserAlreadyExistsException } from '@/core/errors/exception'
import { AuthFailure, DatabaseFailure } from '@/core/errors/failure'
import type { RegisterRepository } from '../../domain/repository/register_repository'
import type { User } from '../../domain/entities/user'
import type { RegisterParam } from '../../application/params/register_params'

// Import de ton instance personnalisée
import { useApi } from '@/core/constants/supabase_client'

export class RegisterRepositoryImpl implements RegisterRepository {
  // On déclare la datasource sans l'instancier ici
  private datasource: RegisterRemoteDatasource

  constructor() {
    // 1. On récupère le client Supabase configuré
    const supabase = useApi()
    
    // 2. On l'injecte dans la datasource (règle l'erreur d'argument)
    this.datasource = new RegisterRemoteDatasource(supabase)
  }

  async register(param: RegisterParam): Promise<User | AuthFailure | DatabaseFailure> {
    try {
      const user = await this.datasource.register(param)
      return user

    } catch (error: any) {
      // Gestion des cas d'erreur spécifiques
      if (error instanceof UserAlreadyExistsException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      // Fallback pour les erreurs inconnues
      return new DatabaseFailure(error.message || 'Une erreur inattendue est survenue lors de l\'enregistrement')
    }
  }
}