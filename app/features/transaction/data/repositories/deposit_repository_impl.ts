import { DepositRemoteDatasource } from '../datasources/deposit_remote_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { DepositRepository } from '../../domain/repository/deposit_repository'
import type { Deposit} from '../../domain/entities/deposit'
import type { DepositParam } from '../../application/params/deposit_params'
import { useApi } from '@/core/constants/supabase_client'

export class DepositRepositoryImpl implements DepositRepository {
  private datasource: DepositRemoteDatasource

  constructor() {
    // Initialisation via ton helper Supabase
    const supabase = useApi()
    
    this.datasource = new DepositRemoteDatasource(supabase)
  }

  async deposit(param: DepositParam): Promise<Deposit | DatabaseFailure> {
    try {
      // 1. Appel à la datasource pour l'insertion brute
      const result = await this.datasource.deposit(param)
      
      // 2. Retourne l'entité DepositEntity en cas de succès
      return result

    } catch (error: any) {
      // 3. Gestion des erreurs de base de données (ex: violation de contrainte, réseau)
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      // 4. Fallback pour toute erreur imprévue
      return new DatabaseFailure(
        error.message || "Une erreur est survenue lors de l'enregistrement de votre dépôt."
      )
    }
  }
}