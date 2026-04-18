import type { Deposit} from '../../domain/entities/deposit'

export class DepositModel implements Deposit {
  id: string
  userId: string
  depositPhoneNumber: string
  amount: number
  method: string
  status: 'pending' | 'completed' | 'failed'
  referenceId?: string

  constructor(data: Deposit) {
    this.id = data.id
    this.userId = data.userId
    this.depositPhoneNumber = data.depositPhoneNumber
    this.amount = data.amount
    this.method = data.method
    this.status = data.status
  }


  static fromSupabase(data: any): DepositModel {
    return new DepositModel({
      id: data.id,
      userId: data.user_id,
      depositPhoneNumber: data.deposit_phone_number,
      amount: Number(data.amount),
      method: data.method,
      status: data.status,
     
    })
  }

  toSupabase(): any {
    return {
      user_id: this.userId,
      deposit_phone_number: this.depositPhoneNumber,
      amount: this.amount,
      method: this.method,
      status: this.status,
   
    }
  }
}