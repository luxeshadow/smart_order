// data/models/user_detail_model.ts
import type { UserDetail } from '../../domain/entities/user_detail'

export class UserDetailModel implements UserDetail {
  id: string
  username: string
  email: string
  role: string
  mainBalance: number
  refundBalance: number
  levelNames: string[] // Liste de noms

  constructor(data: UserDetail) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.role = data.role
    this.mainBalance = data.mainBalance
    this.refundBalance = data.refundBalance
    this.levelNames = data.levelNames
  }

  static fromSupabase(data: any): UserDetailModel {
    return new UserDetailModel({
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      mainBalance: Number(data.main_balance || 0),
      refundBalance: Number(data.refund_balance || 0),
      levelNames: Array.isArray(data.level_names) 
        ? data.level_names 
        : data.level_names ? [data.level_names] : []
    })
  }

  toSupabase(): any {
    return {
      username: this.username,
      role: this.role,
      main_balance: this.mainBalance,
      refund_balance: this.refundBalance
      // On n'update pas les niveaux via cette table en général
    }
  }
}