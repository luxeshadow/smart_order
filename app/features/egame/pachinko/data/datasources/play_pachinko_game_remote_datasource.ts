import { checkUserActiveLevel } from '@/core/utils/check_user_level'
import { DatabaseException, ActiveLevelRequiredException } from '@/core/errors/exception'

export interface StartGameResult {
  session_id: string
  new_balance: number
}

export interface RevealBrickResult {
  result: 'SAFE' | 'BOOM'
  item: 'mushroom' | 'bomb'
  current_level?: number
  win_amount?: number
  full_row?: string[]
  status: 'IN_PROGRESS' | 'WON' | 'LOST'
}

export interface CashoutResult {
  status: 'CASHED_OUT'
  win_amount: number
}

export class PlayPachinkoGameRemoteDatasource {
  constructor(private readonly supabase: any) {}

  async checkUserActiveLevel(userId: string): Promise<boolean> {
    try {
      const isActive = await checkUserActiveLevel(this.supabase, userId)

      if (!isActive) {
        throw new ActiveLevelRequiredException("Un niveau actif est requis pour pouvoir jouer.")
      }

      return true
    } catch (error: any) {
      if (error instanceof ActiveLevelRequiredException) throw error

      throw new DatabaseException(
        error.message || 'Erreur lors de la vérification du niveau actif.'
      )
    }
  }


  async startGame(userId: string, betAmount: number): Promise<StartGameResult> {
    try {

      await this.checkUserActiveLevel(userId)

      const { data, error } = await this.supabase.rpc(
        'rpc_start_mario_game',
        {
          p_bet_amount: betAmount
        }
      )

      if (error) throw new DatabaseException(error.message)

      return data as StartGameResult

    } catch (error: any) {
      if (
        error instanceof ActiveLevelRequiredException || 
        error instanceof DatabaseException
      ) {
        throw error
      }

      throw new DatabaseException(
        error.message || 'Erreur lors du démarrage de la partie.'
      )
    }
  }

  /**
   * 2. Révèle une brique
   */
  async revealBrick(
    sessionId: string,
    userId: string,
    col: number
  ): Promise<RevealBrickResult> {

    try {
      const { data, error } = await this.supabase.rpc(
        'rpc_reveal_brick',
        {
          p_session_id: sessionId,
          p_col: col
        }
      )

      if (error) throw new DatabaseException(error.message)

      return data as RevealBrickResult

    } catch (error: any) {

      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || 'Erreur lors de la vérification de la brique.'
      )
    }
  }

  /**
   * 3. Cashout
   */
  async cashout(
    sessionId: string,
    userId: string
  ): Promise<CashoutResult> {

    try {
      const { data, error } = await this.supabase.rpc(
        'rpc_cashout_mario_game',
        {
          p_session_id: sessionId
        }
      )

      if (error) throw new DatabaseException(error.message)

      return data as CashoutResult

    } catch (error: any) {

      if (error instanceof DatabaseException) throw error

      throw new DatabaseException(
        error.message || "Erreur lors de l'encaissement."
      )
    }
  }
}