import type { PlatformStats } from "../../domain/entities/platform_stats";

export class PlatformStatsModel implements PlatformStats {
  constructor(
    public countClients: number,
    public countAdmins: number,
    public countFakes: number,
    public totalDeposits: number,
    public totalWithdrawals: number
  ) {}

  static fromSupabase(map: any): PlatformStatsModel {
    return new PlatformStatsModel(
      Number(map.count_clients ?? 0),
      Number(map.count_admins ?? 0),
      Number(map.count_fakes ?? 0),
      Number(map.total_deposits ?? 0),
      Number(map.total_withdrawals ?? 0)
    );
  }
}