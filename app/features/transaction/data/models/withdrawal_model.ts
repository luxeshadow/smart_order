import type { Withdrawal } from '../../domain/entities/withdrawal'

export class WithdrawalModel implements Withdrawal {
  userId: string
  amount: number
  method: string
  phoneNumber: string
  password: string
  firstName?: string
  lastName?: string
  id?: string 
  status?: 'pending' | 'completed' | 'rejected'

  constructor(data: Withdrawal) {
    this.userId = data.userId
    this.amount = data.amount
    this.method = data.method
    this.phoneNumber = data.phoneNumber
    this.password = data.password
    this.firstName = data.firstName
    this.lastName = data.lastName
  }

  static fromSupabase(data: any): WithdrawalModel {
    return new WithdrawalModel({
      userId: data.user_id,
      amount: Number(data.amount),
      method: data.method,
      phoneNumber: data.phone_number,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
    })
  }

  toSupabase(): any {
    return {
      user_id: this.userId,
      amount: this.amount,
      method: this.method,
      phone_number: this.phoneNumber,
      password: this.password,
      first_name: this.firstName,
      last_name: this.lastName,
    }
  }
}