import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import { PlayPachinkoGameRemoteDatasource, type StartGameResult, type RevealBrickResult, type CashoutResult } from '../datasources/play_pachinko_game_remote_datasource'

export class PlayPachinkoGameRepositoryImpl {
  private readonly datasource: PlayPachinkoGameRemoteDatasource

  constructor() {
    this.datasource = new PlayPachinkoGameRemoteDatasource(useApi())
  }

  /**
   * Lancer la partie
   */
  async startGame(userId: string, betAmount: number): Promise<StartGameResult | DatabaseFailure> {
    try {
      return await this.datasource.startGame(userId, betAmount)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || 'Impossible de lancer la partie.')
    }
  }

  async revealBrick(sessionId: string, userId: string, col: number): Promise<RevealBrickResult | DatabaseFailure> {
    try {
      return await this.datasource.revealBrick(sessionId, userId, col)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || 'Erreur lors du coup joué.')
    }
  }

  async cashout(sessionId: string, userId: string): Promise<CashoutResult | DatabaseFailure> {
    try {
      return await this.datasource.cashout(sessionId, userId)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || "Erreur lors de l'encaissement.")
    }
  }
}