import type { Failure } from '@/core/errors/failure'
import type { ValidateMyOrderItemParam } from "../../application/params/validate_my_order_item_params";

export interface ValidateMyOrderItemRepository {
  
  validateOrderItem(param:ValidateMyOrderItemParam): Promise<void| Failure>;
  
}
