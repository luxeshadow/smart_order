export type UserRole = 'client' | 'admin'

export interface User {
  id: string
  username: string
  phoneNumber: string
  role: UserRole
}