export interface DepositParam {
  userId: string;            
  depositPhoneNumber: string;  
  amount: number;              
  method: string;              
  referenceId?: string;       
}