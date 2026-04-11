import { DatabaseException } from '@/core/errors/exception'
import { WithdrawalModel } from '../models/withdrawal_model'
import type { WithdrawParam } from '../../application/params/withdrawal_params'

export class WithdrawalRemoteDatasource {
  constructor(private supabase: any) {}

  async withdraw(param: WithdrawParam): Promise<WithdrawalModel> {
    try {
      // On utilise .rpc() pour appeler notre fonction sécurisée
      const { data, error } = await this.supabase
        .rpc('handle_withdrawal_request', {
          p_user_id: param.userId,
          p_amount: param.amount,
          p_method: param.method,
          p_phone: param.phoneNumber,
          p_password: param.password,
          p_first_name: param.firstName || null,
          p_last_name: param.lastName || null
        })
        .single(); // On attend un seul objet en retour

      if (error) {
        throw new DatabaseException(this.translateError(error.message))
      }

      if (!data) {
        throw new DatabaseException("Une erreur inconnue est survenue.")
      }

      return WithdrawalModel.fromSupabase(data)

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(
        error.message || "Erreur lors de la communication avec le serveur."
      )
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Erreur lors de la transaction."
    
    if (message.includes("password_incorrect")) {
        return "Le mot de passe de retrait est incorrect."
    }
    
    if (message.includes("violates check constraint")) return "Montant invalide ou solde insuffisant."
    
    return message
  }
}