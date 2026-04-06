import { DatabaseException } from '@/core/errors/exception'
import type { ValidateMyOrderItemParam } from '../../application/params/validate_my_order_item_params'

export class ValidateMyOrderItemRemoteDatasource {
  constructor(private supabase: any) {}

  async validateOrderItem(param: ValidateMyOrderItemParam): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('process_order_validation', {
        p_user_id: param.userId,
        p_order_item_id: param.orderItemId
      });

      if (error) {
        throw new DatabaseException(error.message);
      }
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error;
      throw new DatabaseException(
        error.message || "Erreur lors de la validation de la commande"
      );
    }
  }
}