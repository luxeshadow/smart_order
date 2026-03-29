import type { User, UserRole } from '../../domain/entities/user'

export class UserModel implements User {
  id: string
  username: string
  phoneNumber: string
  role: UserRole

  constructor(data: User) {
    this.id = data.id
    this.username = data.username
    this.phoneNumber = data.phoneNumber
    this.role = data.role
  }

  static fromSupabase(data: any): UserModel {
    return new UserModel({
      id: data.id,
      username: data.username,
      phoneNumber: data.phone_number,
      role: data.role,
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