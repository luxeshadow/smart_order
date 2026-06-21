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

      // --- LOGIQUE DE RARETÉ DU JACKPOT SÉCURISÉE ---
      let winningIndex: number = 0
      const randomRoll = Math.random() // Entre 0 et 1

      if (randomRoll < 0.60) {
        // 1. Perte (60% de chances globales)
        const skullIndices = ROULETTE_SLICES.map((slice, idx) => slice.type === 'skull' ? idx : -1).filter(idx => idx !== -1)
        
        // Utilisation de ?? 0 pour garantir un type strict 'number'
        winningIndex = skullIndices[Math.floor(Math.random() * skullIndices.length)] ?? 0
      } else {
        // 2. Gain (40% de chances globales)
        const jackpotRoll = Math.random() 

        if (jackpotRoll < 0.03) {
          // 3% de chances d'avoir le Jackpot (soit 1.2% absolu)
          const jackpotIndices = ROULETTE_SLICES.map((slice, idx) => slice.mult === 5 ? idx : -1).filter(idx => idx !== -1)
          
          if (jackpotIndices.length > 0) {
            winningIndex = jackpotIndices[Math.floor(Math.random() * jackpotIndices.length)] ?? 9 // Fallback index de ta case 5x au cas où
          } else {
            winningIndex = ROULETTE_SLICES.findIndex(slice => slice.type === 'win' && slice.mult !== 5)
          }
        } else {
          // 97% de chances d'avoir un gain classique
          const normalWinIndices = ROULETTE_SLICES.map((slice, idx) => (slice.type === 'win' && slice.mult !== 5) ? idx : -1).filter(idx => idx !== -1)
          
          winningIndex = normalWinIndices[Math.floor(Math.random() * normalWinIndices.length)] ?? 1
        }
      }

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