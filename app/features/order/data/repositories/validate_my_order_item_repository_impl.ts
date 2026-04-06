import { Failure, DatabaseFailure } from '@/core/errors/failure'
import { DatabaseException } from '@/core/errors/exception'
import { useApi } from '@/core/constants/supabase_client'

import { ValidateMyOrderItemRemoteDatasource } from '../datasources/validate_my_order_item_remote_datasource'
import type { ValidateMyOrderItemRepository } from '../../domain/repository/validate_my_order_item_repository'
import type { ValidateMyOrderItemParam } from '../../application/params/validate_my_order_item_params'

export class ValidateMyOrderItemRepositoryImpl implements ValidateMyOrderItemRepository {
  private remoteDataSource: ValidateMyOrderItemRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.remoteDataSource = new ValidateMyOrderItemRemoteDatasource(supabase)
  }

  async validateOrderItem(param: ValidateMyOrderItemParam): Promise<void | Failure> {
    try {
      await this.remoteDataSource.validateOrderItem(param);
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      
      return new DatabaseFailure(
        error.message || "Erreur lors de la validation de la commande."
      )
    }
  }
}