import type { Wallet } from '../../domain/entities/wallet'

export class WalletModel implements Wallet {
  id?: string
  userId: string
  withdrawalPassword: string
  paymentAddress: string

  constructor(data: Wallet) {
    this.id = data.id
    this.userId = data.userId
    this.withdrawalPassword = data.withdrawalPassword
    this.paymentAddress = data.paymentAddress
  }

  static fromSupabase(data: any): WalletModel {
    return new WalletModel({
      id: data.id,
      userId: data.user_id,
      withdrawalPassword: data.withdrawal_password,
      paymentAddress: data.payment_address
    })
  }

  toSupabase(): any {
    return {
      user_id: this.userId,
      withdrawal_password: this.withdrawalPassword,
      payment_address: this.paymentAddress,
      updated_at: new Date().toISOString()
    }
  }
}