import { DatabaseException } from '@/core/errors/exception'
import type { GetMyPrincipalBalanceParam } from '../../application/params/get_my_principal_balance_params'

export class GetMyPrincipalBalanceRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async getMyPrincipalBalance(param: GetMyPrincipalBalanceParam): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('main_balance')
        .eq('id', param.userId)
        .single()

      if (error) {
        throw new DatabaseException(this.translateError(error.message))
      }

      return data?.main_balance ?? 0

    }  catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(
        error.message || "Impossible de récupérer votre solde principal."
      )
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Erreur lors de la récupération du solde."

    if (message.includes("JSON object requested, but no rows were returned")) {
      return "Compte utilisateur introuvable."
    }

    if (message.includes("database connection error")) {
      return "Problème de connexion à la base de données."
    }

    return message
  }
}