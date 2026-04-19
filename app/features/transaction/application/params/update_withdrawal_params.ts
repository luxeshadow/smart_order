
export interface UpdateWithdrawalParam {
  id: string
  amount?: number
  method?: string
  phoneNumber?: string
  password?: string
  firstName?: string
  lastName?: string
  status?: 'pending' | 'completed' | 'rejected'
}