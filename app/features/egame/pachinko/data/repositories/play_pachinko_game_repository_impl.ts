import { useApi } from '@/core/constants/supabase_client'
import { DatabaseException } from '@/core/errors/exception'
import { DatabaseFailure } from '@/core/errors/failure'
import { PACHINKO_BUCKETS } from '@/core/constants/pachinko_game'
import type { PlayPachinkoGameParam } from '../../application/params/play_pachinko_game_params'
import type { PlayPachinkoGameRepository } from '../../domain/repository/play_pachinko_game_repository'
import { PlayPachinkoGameRemoteDatasource } from '../datasources/play_pachinko_game_remote_datasource'
import { PachinkoResultModel } from '../models/pachinko_result_model'

export class PlayPachinkoGameRepositoryImpl implements PlayPachinkoGameRepository {
  private readonly datasource: PlayPachinkoGameRemoteDatasource

  constructor() {
    this.datasource = new PlayPachinkoGameRemoteDatasource(useApi())
  }

  async playPachinkoGame(param: PlayPachinkoGameParam): Promise<PachinkoResultModel | DatabaseFailure> {
    try {
      const user = await this.datasource.getUserData(param.userId)
      const currentBalance = Number(user.main_balance)
      if (currentBalance < param.betAmount) throw new DatabaseException('Solde insuffisant.')

      const lossIndices = PACHINKO_BUCKETS.flatMap((bucket, index) => bucket.type === 'loss' ? [index] : [])
      const regularWinIndices = PACHINKO_BUCKETS.flatMap((bucket, index) => bucket.type === 'win' && bucket.mult !== 10 ? [index] : [])
      const jackpotIndex = PACHINKO_BUCKETS.findIndex(bucket => bucket.mult === 10)

      let winningIndex: number
      if (Math.random() < 0.60) {
        winningIndex = lossIndices[Math.floor(Math.random() * lossIndices.length)] ?? 0
      } else if (Math.random() < 0.03 && jackpotIndex >= 0) {
        winningIndex = jackpotIndex
      } else {
        winningIndex = regularWinIndices[Math.floor(Math.random() * regularWinIndices.length)] ?? 1
      }

      const bucket = PACHINKO_BUCKETS[winningIndex]
      if (!bucket) throw new DatabaseException('Une erreur interne est survenue lors du tirage.')

      const gains = Math.floor(param.betAmount * bucket.mult)
      const isWin = bucket.type === 'win'
      await this.datasource.updateMainBalance(param.userId, currentBalance - param.betAmount + gains)

      if (isWin && gains > 0) {
        await this.datasource.insertWinningDeposit(param.userId, user.phone_number || '00000000', gains)
      }

      return new PachinkoResultModel(winningIndex, gains, isWin)
    } catch (error: any) {
      if (error instanceof DatabaseException) return new DatabaseFailure(error.message)
      return new DatabaseFailure(error.message || "Une erreur est survenue lors de l'exécution du jeu.")
    }
  }
}
