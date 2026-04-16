export interface MyTransaction {
  id: string;
  amount: number;
  method: string;
  status: string;
  type: 'deposit' | 'withdrawal';
  createdAt: string;
}