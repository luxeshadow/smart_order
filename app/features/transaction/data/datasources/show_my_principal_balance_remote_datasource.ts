import { DatabaseException } from '@/core/errors/exception'
import type { ShowMyPrincipalBalanceParam } from '../../application/params/show_my_principal_balance_params'
import { UserBalanceModel } from '../models/user_balance_model'
import type { UserBalance } from '../../domain/entities/user_balance'

export class ShowMyPrincipalBalanceRemoteDatasource {
  constructor(private supabase: any) {}

  async getMyPrincipalBalance(
    param: ShowMyPrincipalBalanceParam
  ): Promise<UserBalance> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('main_balance, daily_earnings, refund_balance')
        .eq('id', param.userId)
        .single()

      if (error) {
        throw new DatabaseException(this.translateError(error.message))
      }

      // 🔥 utilisation du model + conversion
      return UserBalanceModel.fromSupabase(data)

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || "Impossible de récupérer vos soldes."
      )
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Erreur lors de la récupération des soldes."

    if (message.includes("JSON object requested, but no rows were returned")) {
      return "Compte utilisateur introuvable."
    }

    if (message.includes("database connection error")) {
      return "Problème de connexion à la base de données."
    }

    return message
  }
}