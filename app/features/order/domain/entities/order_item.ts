export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  isLucky: boolean;
  priceAtPurchase: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  productName?: string;
  productPhoto?: string;
}