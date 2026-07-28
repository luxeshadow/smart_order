import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException, ActiveLevelRequiredException } from '@/core/errors/exception'
import { DatabaseFailure, ActiveLevelRequiredFailure } from '@/core/errors/failure'
import { PlayPachinkoGameRemoteDatasource, type StartGameResult, type RevealBrickResult, type CashoutResult } from '../datasources/play_pachinko_game_remote_datasource'

export class PlayPachinkoGameRepositoryImpl {
  private readonly datasource: PlayPachinkoGameRemoteDatasource

  constructor() {
    this.datasource = new PlayPachinkoGameRemoteDatasource(useApi())
  }

  /**
   * Vérification du niveau actif avant de pouvoir jouer
   */
  async checkUserActiveLevel(userId: string): Promise<boolean | ActiveLevelRequiredFailure | DatabaseFailure> {
    try {
      return await this.datasource.checkUserActiveLevel(userId)
    } catch (error: any) {
      if (error instanceof ActiveLevelRequiredException) {
        return new ActiveLevelRequiredFailure(error.message)
      }
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(error.message || 'Erreur lors de la vérification du niveau.')
    }
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

  /**
   * Révéler une brique
   */
  async revealBrick(sessionId: string, userId: string, col: number): Promise<RevealBrickResult | DatabaseFailure> {
    try {
      return await this.datasource.revealBrick(sessionId, userId, col)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || 'Erreur lors du coup joué.')
    }
  }

  /**
   * Encaissement (Cashout)
   */
  async cashout(sessionId: string, userId: string): Promise<CashoutResult | DatabaseFailure> {
    try {
      return await this.datasource.cashout(sessionId, userId)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || "Erreur lors de l'encaissement.")
    }
  }
}