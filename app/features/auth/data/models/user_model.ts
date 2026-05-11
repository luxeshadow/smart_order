import type { User } from '../../domain/entities/user'

export class UserModel implements User {
  id: string
  username: string
  email: string
  phoneNumber: string
  role: string
  token?: string

  referredBy?: string | null

  constructor(data: User) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.phoneNumber = data.phoneNumber
    this.role = data.role
    this.token = data.token

    this.referredBy = data.referredBy
  }

  static fromSupabase(
    data: any,
    token?: string,
    authEmail?: string
  ): UserModel {
    return new UserModel({
      id: data.id,
      username: data.username,
      email: authEmail || '',
      phoneNumber: data.phone_number,
      role: data.role,
      token,

      referredBy: data.referred_by
    })
  }

  toSupabase(): any {
    return {
      id: this.id,
      username: this.username,
      phone_number: this.phoneNumber,
      role: this.role,

      referred_by: this.referredBy
    }
  }
}