export type UserRole = 'client' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  phoneNumber: string
  role: UserRole
  token?: string
}