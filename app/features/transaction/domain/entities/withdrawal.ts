export interface Withdrawal {
  userId: string
  id: string
  amount: number
  userName?: string
  email?: string
  method: string
  phoneNumber: string
  password: string
  firstName?: string
  lastName?: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: string | null
}