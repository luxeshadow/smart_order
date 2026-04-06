import type { OrderItem } from "../entities/order_item";
import type { Failure } from '@/core/errors/failure';
import type { ListMyOrderItemParam } from "../../application/params/list_my_order_item_params";

export interface ListMyOrderItemRepository {
  getMyPendingOrders(param: ListMyOrderItemParam): Promise<OrderItem[] | Failure>;

}