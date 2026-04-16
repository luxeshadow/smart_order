import { DatabaseException } from '@/core/errors/exception'
import type { ShowMyPrincipalBalanceParam } from '../../application/params/show_my_principal_balance_params'

export class ShowMyPrincipalBalanceRemoteDatasource {
  constructor(private supabase: any) {}

  async getMyPrincipalBalance(param: ShowMyPrincipalBalanceParam): Promise<{ main: number; earnings: number; refund: number }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('main_balance, daily_earnings, refund_balance') 
        .eq('id', param.userId)
        .single()

      if (error) {
        throw new DatabaseException(this.translateError(error.message))
      }

      return {
        main: data?.main_balance ?? 0,
        earnings: data?.daily_earnings ?? 0,
        refund: data?.refund_balance ?? 0
      }

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