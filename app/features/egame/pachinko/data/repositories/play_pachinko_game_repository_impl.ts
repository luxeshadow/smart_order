import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import type { PlayPachinkoGameParam } from '../../application/params/play_pachinko_game_params'
import type { PlayPachinkoGameRepository } from '../../domain/repository/play_pachinko_game_repository'
import { PlayPachinkoGameRemoteDatasource } from '../datasources/play_pachinko_game_remote_datasource'
import { PachinkoResultModel } from '../models/pachinko_result_model'

// On étend le paramètre pour transmettre les gains réels du mini-jeu Mario
export interface PlayMarioGameParam extends PlayPachinkoGameParam {
  winAmount?: number
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

      // 1. Déduction de la mise
      if (currentBalance < param.betAmount) {
        throw new DatabaseException('Solde insuffisant.')
      }

      // 2. Récupération des valeurs issues de la partie Mario
      const gains = param.winAmount ?? 0
      const isWin = param.isWin ?? (gains > 0)

      // 3. Calcul et mise à jour du nouveau solde : Ancien solde - Mise + Gain
      const newBalance = currentBalance - param.betAmount + gains
      await this.datasource.updateMainBalance(param.userId, newBalance)

      // 4. Si c'est un gain, enregistrement du dépôt
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