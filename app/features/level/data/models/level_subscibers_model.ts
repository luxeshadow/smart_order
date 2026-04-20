import type { LevelSubscriber } from "../../domain/entities/level_subscibers";

export class LevelSubscriberModel implements LevelSubscriber {
  constructor(
    public name: string,
    public activeClientsCount: number,
    public maxOrderItem: number,
    public price: number
  ) {}
  static fromSupabase(map: any): LevelSubscriberModel {
    return new LevelSubscriberModel(
      map.name ?? '',
      map.active_clients_count ?? (map.users_levels?.[0]?.count ?? 0),
      map.max_order_item ?? 0,
      map.price ?? 0
    );
  }

  static fromSupabaseList(list: any[]): LevelSubscriberModel[] {
    return list.map((item) => LevelSubscriberModel.fromSupabase(item));
  }
}