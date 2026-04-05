import type { UserLevel } from '../../domain/entities/user_level'

export class UserLevelModel implements UserLevel {
  constructor(
    public id: string,
    public userId: string,
    public levelId: string
  ) {}

  static fromSupabase(map: any): UserLevelModel {
    return new UserLevelModel(
      map.id,
      map.user_id,
      map.level_id
    );
  }


  toSupabase(): any {
    return {
      user_id: this.userId,
      level_id: this.levelId
    };
  }
}