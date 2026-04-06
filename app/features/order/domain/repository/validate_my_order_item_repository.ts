import type { Failure } from '@/core/errors/failure'

export interface ValidateMyOrderItemRepository {
  
  validateOrderItem(userId: string, orderItemId: string): Promise<void| Failure>;
  
}
