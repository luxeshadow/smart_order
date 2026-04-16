import type { MyTransaction } from '../../domain/entities/my_transaction'

export class MyTransactionModel implements MyTransaction {
  id: string
  amount: number
  method: string
  status: string
  type: 'deposit' | 'withdrawal'
  createdAt: string

  constructor(data: MyTransaction) {
    this.id = data.id
    this.amount = data.amount
    this.method = data.method
    this.status = data.status
    this.type = data.type
    this.createdAt = data.createdAt
  }


  static fromSupabase(data: any, type: 'deposit' | 'withdrawal'): MyTransactionModel {
    return new MyTransactionModel({
      id: data.id,
      amount: Number(data.amount),
      method: data.method,
      status: data.status,
      type: type,
      createdAt: data.created_at
    })
  }

  toSupabase(): any {
    return {
      id: this.id,
      amount: this.amount,
      method: this.method,
      status: this.status,
      created_at: this.createdAt
    }
  }
}