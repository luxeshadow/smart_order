// domain/entities/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  photoUrl?: string; 
}