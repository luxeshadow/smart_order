import type { Withdrawal } from '../../domain/entities/withdrawal'

export class WithdrawalModel implements Withdrawal {
  id: string
  userId: string
  username: string | null
  email: string | null
  amount: number
  method: string
  phoneNumber: string
  password: string
  firstName?: string
  lastName?: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string | null

  constructor(data: Withdrawal & {
    id?: string
    username?: string | null
    email?: string | null
  }) {
    this.id = data.id ?? ''

    this.userId = data.userId
    this.username = data.username ?? null
    this.email = data.email ?? null

    this.amount = data.amount
    this.method = data.method
    this.phoneNumber = data.phoneNumber
    this.password = data.password

    this.firstName = data.firstName
    this.lastName = data.lastName
    this.status = data.status
    this.createdAt = data.createdAt ?? null
  }

  static fromSupabase(data: any): WithdrawalModel {
    return new WithdrawalModel({
      id: data.id,
      userId: data.user_id,
      username: data.username ?? null,
      email: data.email ?? null,
      amount: Number(data.amount),
      method: data.method,
      phoneNumber: data.phone_number,
      password: data.password ?? '',
      firstName: data.first_name,
      lastName: data.last_name,
      status: data.status,
      createdAt: data.created_at ?? null
    })
  }
}