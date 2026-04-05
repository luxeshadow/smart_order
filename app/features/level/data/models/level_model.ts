import type { Level } from '../../domain/entities/level';

export class LevelModel implements Level {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public maxProductPrice: number | null
  ) {}

  static fromSupabase(map: any): LevelModel {
    return new LevelModel(
      map.id,
      map.name,
      Number(map.price),
      map.max_product_price ? Number(map.max_product_price) : null
    );
  }

  static fromSupabaseList(list: any[]): LevelModel[] {
    return list.map((item) => LevelModel.fromSupabase(item));
  }

  toSupabase(): any {
    return {
      name: this.name,
      price: this.price,
      max_product_price: this.maxProductPrice
    };
  }
}