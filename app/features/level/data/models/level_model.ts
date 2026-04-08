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
      map.max_order_item ? Number(map.max_order_item) : null
    );
  }

  static fromSupabaseList(list: any[]): LevelModel[] {
    return list.map((item) => LevelModel.fromSupabase(item));
  }

  toSupabase(): any {
    return {
      name: this.name,
      price: this.price,
      max_order_item: this.maxProductPrice
    };
  }
}