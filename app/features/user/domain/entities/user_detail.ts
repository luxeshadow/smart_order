// domain/entities/user_detail.ts
export interface UserDetail {
  id: string
  username: string
  email: string
  role: string
  mainBalance: number
  refundBalance: number
  levelNames: string[] 
}