import { DatabaseException } from '@/core/errors/exception'
import type { RefundToMainBalanceParam } from '../../application/params/refund_to_main_balance_params'

export class RefundToMainBalanceRemoteDatasource {
  constructor(private supabase: any) {}


  async refundToMainBalance(param: RefundToMainBalanceParam): Promise<void> {
    try {
      // Appel de la fonction RPC avec l'ID extrait du paramètre
      const { error } = await this.supabase.rpc('transfer_refund_to_main_checked', {
        user_id_input: param.userId
      });

      if (error) {
        // Capture l'erreur spécifique renvoyée par le SQL (ex: "Certaines commandes ne sont pas validées")
        throw new DatabaseException(error.message);
      }
      
    } catch (error: any) {
      // Si c'est déjà une DatabaseException, on la propage
      if (error instanceof DatabaseException) throw error;
      
      // Sinon, on wrap l'erreur inconnue
      throw new DatabaseException(
        error.message || "Erreur technique lors du transfert sécurisé du solde."
      );
    }
  }
}