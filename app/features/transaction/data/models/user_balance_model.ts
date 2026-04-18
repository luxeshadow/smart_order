import { UserBalance } from '../../domain/entities/user_balance'

export class UserBalanceModel extends UserBalance {
  constructor(params: {
    main: number
    earnings: number
    refund: number
  }) {
    super(params)
  }

  static fromSupabase(data: any): UserBalanceModel {
    return new UserBalanceModel({
      main: Number(data?.main_balance ?? 0),
      earnings: Number(data?.daily_earnings ?? 0),
      refund: Number(data?.refund_balance ?? 0)
    })
  }

}