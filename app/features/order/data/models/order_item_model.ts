import type { OrderItem } from '../../domain/entities/order_item';

export class OrderItemModel implements OrderItem {
  constructor(
    public id: string,
    public orderId: string,
    public productId: string,
    public isLucky: boolean,
    public priceAtPurchase: number,
    public commission: number,
    public status: 'pending' | 'completed' | 'cancelled',
    public createdAt: string,
    public productName: string,
    public productPhoto: string
  ) {}

  static fromSupabase(map: any): OrderItemModel {
    return new OrderItemModel(
      map.id,
      map.order_id,
      map.product_id,
      map.is_lucky ?? false,
      Number(map.price_at_purchase),
      Number(map.commission),
      map.status,
      map.created_at,
      map.products?.name || 'Produit inconnu',
      map.products?.photo_url || ''
    );
  }

  static fromSupabaseList(list: any[]): OrderItemModel[] {
    return list.map((item) => OrderItemModel.fromSupabase(item));
  }

  toSupabase(): any {
    return {
      order_id: this.orderId,
      product_id: this.productId,
      is_lucky: this.isLucky,
      price_at_purchase: this.priceAtPurchase,
      commission: this.commission,
      status: this.status
    };
  }
}