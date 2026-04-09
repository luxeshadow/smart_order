import { DatabaseException } from '@/core/errors/exception'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'

export class ListMyTransactionRemoteDatasource {
  constructor(private supabase: any) {}

  async getRawTransactions(param: ListMyTransactionParam): Promise<{ withdrawals: any[], deposits: any[] }> {
    try {
      const [wResponse, dResponse] = await Promise.all([
        this.supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', param.userId),
        this.supabase
          .from('deposits')
          .select('*')
          .eq('user_id', param.userId)
      ]);

      if (wResponse.error) throw new DatabaseException(wResponse.error.message);
      if (dResponse.error) throw new DatabaseException(dResponse.error.message);

      return {
        withdrawals: wResponse.data || [],
        deposits: dResponse.data || []
      };

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error;
      throw new DatabaseException(
        error.message || "Erreur lors de la récupération des données brutes."
      );
    }
  }
}