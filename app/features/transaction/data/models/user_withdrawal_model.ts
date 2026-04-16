import type { UserWithdrawal } from '../../domain/entities/users_withdrawal'

export class UserWithdrawalModel implements UserWithdrawal {
  id: string
  userId: string
  username: string
  email: string
  amount: number
  method: string
  phoneNumber: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string

  constructor(data: UserWithdrawal) {
    this.id = data.id
    this.userId = data.userId
    this.username = data.username
    this.email = data.email
    this.amount = data.amount
    this.method = data.method
    this.phoneNumber = data.phoneNumber
    this.status = data.status
    this.createdAt = data.createdAt
  }

  static fromSupabase(data: any): UserWithdrawalModel {
    return new UserWithdrawalModel({
      id: data.id,
      userId: data.user_id,
      username: data.users?.username || 'Inconnu',
      email: data.users?.email || 'Email non disponible',
      amount: Number(data.amount),
      method: data.method,
      phoneNumber: data.phone_number,
      status: data.status || 'pending',
      createdAt: data.created_at
    })
  }
}