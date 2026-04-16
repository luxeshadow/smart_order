import { DatabaseException } from '@/core/errors/exception'
import type { RefundToMainBalanceParam } from '../../application/params/refund_to_main_balance_params'

export class RefundToMainBalanceRemoteDatasource {
  constructor(private supabase: any) {}


  async refundToMainBalance(param: RefundToMainBalanceParam): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('transfer_refund_to_main_checked', {
        user_id_input: param.userId
      });

      if (error) {
        throw new DatabaseException(error.message);
      }
      
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error;
      throw new DatabaseException(
        error.message || "Erreur technique lors du transfert sécurisé du solde."
      );
    }
  }
}