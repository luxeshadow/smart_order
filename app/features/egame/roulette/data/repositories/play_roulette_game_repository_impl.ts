// features/transaction/data/repositories/play_roulette_game_repository_impl.ts
import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import { PlayRouletteGameRemoteDatasource } from '../datasources/play_roulette_game_remote_datasource'
import type { PlayRouletteGameRepository } from '../../domain/repository/play_roulette_game_repository'
import type { PlayRouletteGameParam } from '../../application/params/play_roulette_game_params'
import { RouletteResultModel } from '../models/roulette_result_model'
import { ROULETTE_SLICES } from '@/core/constants/roulette_game' 

export class PlayRouletteGameRepositoryImpl implements PlayRouletteGameRepository {
  private datasource: PlayRouletteGameRemoteDatasource

  constructor() {
    const supabase = useApi()
    this.datasource = new PlayRouletteGameRemoteDatasource(supabase)
  }

  async playRouletteGame(param: PlayRouletteGameParam): Promise<RouletteResultModel | DatabaseFailure> {
    const { userId, betAmount } = param

    try {
      const user = await this.datasource.getUserData(userId)
      const currentBalance = Number(user.main_balance)

      if (currentBalance < betAmount) {
        throw new DatabaseException("Solde insuffisant.")
      }

      // Utilisation directe de la constante globale
      const winningIndex = Math.floor(Math.random() * ROULETTE_SLICES.length)
      const choice = ROULETTE_SLICES[winningIndex]

      if (!choice) {
        throw new DatabaseException("Une erreur interne est survenue lors du tirage de la roue.")
      }

      const isWin = choice.type === 'win'
      const gains = Math.floor(betAmount * choice.mult)
      const finalBalance = currentBalance - betAmount + gains

      await this.datasource.updateMainBalance(userId, finalBalance)

      if (isWin && gains > 0) {
        await this.datasource.insertWinningDeposit(userId, user.phone_number || '00000000', gains)
      }

      return new RouletteResultModel(winningIndex, gains, isWin)
    } catch (error: any) {
      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }
      return new DatabaseFailure(error.message || "Une erreur est survenue lors de l'exécution du jeu.")
    }
  }
}