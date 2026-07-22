import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { PlayPachinkoGameParam } from '../../application/params/play_pachinko_game_params'
import type { PlayPachinkoGameRepository } from '../../domain/repository/play_pachinko_game_repository'
import { PlayPachinkoGameRemoteDatasource } from '../datasources/play_pachinko_game_remote_datasource'
import { PachinkoResultModel } from '../models/pachinko_result_model'

// Table des multiplicateurs maximaux autorisés par niveau (4 bombes / 2 champignons)
const BASE_MULT = 1.25
const STEP_MULT = 0.25
const MAX_ROWS = 8
const ABSOLUTE_MAX_MULT = BASE_MULT + (MAX_ROWS - 1) * STEP_MULT // Max x3.00

export interface PlayMarioGameParam extends PlayPachinkoGameParam {
  levelReached?: number // On envoie uniquement l'étage atteint (0 à 8)
  isWin?: boolean
}

export class PlayPachinkoGameRepositoryImpl implements PlayPachinkoGameRepository {
  private readonly datasource: PlayPachinkoGameRemoteDatasource

  constructor() {
    this.datasource = new PlayPachinkoGameRemoteDatasource(useApi())
  }

  async playPachinkoGame(param: PlayMarioGameParam): Promise<PachinkoResultModel | DatabaseFailure> {
    try {
      const user = await this.datasource.getUserData(param.userId)
      const currentBalance = Number(user.main_balance)

      // 1. Vérification du solde
      if (currentBalance < param.betAmount) {
        throw new DatabaseException('Solde insuffisant.')
      }

      // 2. Sécurisation : Calcul Strict du Gain Côté Serveur
      let gains = 0
      const isWin = Boolean(param.isWin)
      const level = Math.min(MAX_ROWS, Math.max(0, param.levelReached ?? 0))

      if (isWin && level > 0) {
        const mult = BASE_MULT + (level - 1) * STEP_MULT
        // Le serveur valide et calcule le gain reel : impossible d'injecter un montant arbitraire
        gains = Math.floor(param.betAmount * Math.min(mult, ABSOLUTE_MAX_MULT))
      }

      // 3. Mise à jour sécurisée du solde
      const newBalance = currentBalance - param.betAmount + gains
      await this.datasource.updateMainBalance(param.userId, newBalance)

      // 4. Inscription du gain
      if (isWin && gains > 0) {
        await this.datasource.insertWinningDeposit(param.userId, user.phone_number || '00000000', gains)
      }

      return new PachinkoResultModel(0, gains, isWin)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || "Une erreur est survenue lors du traitement du jeu.")
    }
  }
}