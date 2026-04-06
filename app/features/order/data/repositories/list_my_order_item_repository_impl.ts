import { ListMyOrderItemRemoteDatasource } from '../datasources/list_my_order_item_datasource'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { ListMyOrderItemRepository } from '../../domain/repository/list_my_order_item_repository'
import type { OrderItem } from '../../domain/entities/order_item'
import type { ListMyOrderItemParam } from '../../application/params/list_my_order_item_params'
import { useApi } from '@/core/constants/supabase_client'

export class ListMyOrderItemRepositoryImpl implements ListMyOrderItemRepository {
  private datasource: ListMyOrderItemRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new ListMyOrderItemRemoteDatasource(supabase)
  }

  async getMyPendingOrders(param: ListMyOrderItemParam): Promise<OrderItem[] | DatabaseFailure> {
    try {
      // La datasource utilise déjà OrderItemModel pour mapper les données
      const orders = await this.datasource.getMyPendingOrders(param)

      // On retourne directement la liste d'entités
      return orders;
      
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(
        error.message || "Erreur lors de la récupération de vos commandes."
      )
    }
  }
}