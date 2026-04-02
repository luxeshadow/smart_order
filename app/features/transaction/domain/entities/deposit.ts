export interface Deposit {
  id: string;                 
  userId: string;           
  depositPhoneNumber: string; 
  amount: number;            
  method: string;             
  status: 'pending' | 'completed' | 'failed'; 

}