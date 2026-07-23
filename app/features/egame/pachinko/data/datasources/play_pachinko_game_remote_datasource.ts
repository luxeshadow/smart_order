import { DatabaseException } from '@/core/errors/exception'

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

  /**
   * 1. Démarre la partie
   */
  async startGame(userId: string, betAmount: number): Promise<StartGameResult> {
    try {
      const { data, error } = await this.supabase.rpc(
        'rpc_start_mario_game',
        {
          p_bet_amount: betAmount
        }
      )

      if (error) throw new DatabaseException(error.message)

      return data as StartGameResult

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error

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