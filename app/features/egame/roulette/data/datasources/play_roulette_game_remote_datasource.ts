// features/transaction/data/datasources/play_roulette_game_remote_datasource.ts
import { DatabaseException } from '@/core/errors/exception'
import { checkUserActiveLevel } from '@/core/utils/check_user_level'

export class PlayRouletteGameRemoteDatasource {
  // Utilisation de "any" pour éviter d'importer directement le client typé de Supabase
  constructor(private supabase: any) {}

  /**
   * Vérification du niveau actif avant de jouer
   */
  async checkUserActiveLevel(userId: string): Promise<boolean> {
    return await checkUserActiveLevel(userId)
  }

  async getUserData(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('main_balance, phone_number')
        .eq('id', userId)
        .single()

      if (error) throw new DatabaseException(error.message)
      return data
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(
        error.message || "Erreur lors de la récupération des données utilisateur"
      )
    }
  }

  async updateMainBalance(userId: string, newBalance: number) {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ main_balance: newBalance })
        .eq('id', userId)

      if (error) throw new DatabaseException(error.message)
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(
        error.message || "Erreur lors de la mise à jour du solde principal"
      )
    }
  }

  async insertWinningDeposit(userId: string, phoneNumber: string, amount: number) {
    try {
      const { error } = await this.supabase
        .from('deposits')
        .insert({
          user_id: userId,
          deposit_phone_number: phoneNumber,
          amount: amount,
          method: 'lucky wheel',
          status: 'completed',
          reference_id: `LW-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        })

      if (error) throw new DatabaseException(error.message)
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(
        error.message || "Erreur lors de l'enregistrement du dépôt de gain"
      )
    }
  }
}