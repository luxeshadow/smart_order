export interface PendingWithdrawalItem {
  id: string
  amount: number
  createdAt: string
  method: string
}

export interface UserWithdrawalGroupViewModel {
  userId: string
  username?: string
  email?: string
  role: string
  phone: string
  validatedAmounts: number[]
  totalValidated: number  
  pendingWithdrawals: PendingWithdrawalItem[]
  totalPending: number
  pendingCount: number   
  lastWithdrawalDate: string | null 
}