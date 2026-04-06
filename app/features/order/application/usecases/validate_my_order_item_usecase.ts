import type { Failure } from '@/core/errors/failure'
import type { ValidateMyOrderItemRepository } from '../../domain/repository/validate_my_order_item_repository'
import type { ValidateMyOrderItemParam } from '../params/validate_my_order_item_params'

export class ValidateMyOrderItemUseCase {
  constructor(private repository: ValidateMyOrderItemRepository) {}

  async execute(param: ValidateMyOrderItemParam): Promise<void | Failure> {
    return await this.repository.validateOrderItem(param);
  }
}