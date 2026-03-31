import type { User, UserRole } from '../../domain/entities/user'

export class UserModel implements User {
  id: string
  username: string
  email: string
  phoneNumber: string
  role: UserRole
  token?: string

  constructor(data: User) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.phoneNumber = data.phoneNumber
    this.role = data.role
    this.token = data.token
  }

  static fromSupabase(data: any, token?: string): UserModel {
    return new UserModel({
      id: data.id,
      username: data.username,
      email: data.email,
      phoneNumber: data.phone_number,
      role: data.role as UserRole,
      token: token 
    })
  }

  toSupabase(): any {
    return {
      id: this.id,
      username: this.username,
      phone_number: this.phoneNumber,
      role: this.role,
    }
  }
}