export interface UserWithdrawal {
  id: string
  userId: string
  username: string
  email: string
  amount: number
  method: string
  phoneNumber: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string
}