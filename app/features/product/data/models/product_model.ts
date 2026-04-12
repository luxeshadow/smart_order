// data/models/product_model.ts
import type { Product } from '../../domain/entities/product'

export class ProductModel implements Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public createdAt: string,
    public photoUrl: string // Ici on le rend obligatoire (comme OrderItem)
  ) {}

  static fromSupabase(map: any): ProductModel {
    return new ProductModel(
      map.id,
      map.name,
      Number(map.price),
      map.created_at,
      map.photo_url || '' // Même logique : si null, alors string vide
    )
  }

  static fromSupabaseList(list: any[]): ProductModel[] {
    return list.map((item) => ProductModel.fromSupabase(item))
  }

  toSupabase() {
    return {
      name: this.name,
      price: this.price,
      photo_url: this.photoUrl === '' ? null : this.photoUrl
    }
  }
}