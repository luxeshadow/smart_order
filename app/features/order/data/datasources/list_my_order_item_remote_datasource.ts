import { DatabaseException } from '@/core/errors/exception'
import type { ListMyOrderItemParam } from '../../application/params/list_my_order_item_params'
import { OrderItemModel } from '../models/order_item_model'

export class ListMyOrderItemRemoteDatasource {
  constructor(private supabase: any) {}

  async getMyPendingOrders(param: ListMyOrderItemParam): Promise<OrderItemModel[]> {
    try {
      const { data, error } = await this.supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          is_lucky,
          price_at_purchase,
          commission,
          status,
          created_at,
          position_index,
          orders!inner (
            user_id
          ),
          products (
            name,
            photo_url
          )
        `)
        // Filtrage sur la colonne user_id de la table orders jointe
        .eq('orders.user_id', param.userId)
        .eq('status', 'pending')
        // Tri par l'index aléatoire généré par PostgreSQL pour mélanger les Lucky Orders
        .order('position_index', { ascending: true });

      if (error) throw new DatabaseException(error.message);

      return OrderItemModel.fromSupabaseList(data || []);
      
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error;
      throw new DatabaseException(
        error.message || "Erreur lors de la récupération des commandes depuis le serveur"
      );
    }
  }
}