import type { User, UserRole } from '../../domain/entities/user'

export interface RegisterParam {
  userName: string
  phoneNumber: string
  password: string
  role: UserRole
}