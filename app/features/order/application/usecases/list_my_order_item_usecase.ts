import type { UseCase } from '@/core/usecase/usecase'
import type { OrderItem } from "../../domain/entities/order_item";
import { Failure } from '@/core/errors/failure';
import type { ListMyOrderItemRepository } from "../../domain/repository/list_my_order_item_repository";
import type { ListMyOrderItemParam } from "../../application/params/list_my_order_item_params";


export class ListMyOrderItemUseCase implements UseCase<OrderItem[], ListMyOrderItemParam> {
  private repository: ListMyOrderItemRepository;

  constructor(repository: ListMyOrderItemRepository) {
    this.repository = repository;
  }

  async execute(param: ListMyOrderItemParam): Promise<OrderItem[] | Failure> {

    return await this.repository.getMyPendingOrders(param);
  }
}