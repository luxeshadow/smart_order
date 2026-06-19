// features/transaction/domain/repository/play_roulette_game_repository.ts
import { Failure } from '@/core/errors/failure'
import type { PlayRouletteGameParam } from '../../application/params/play_roulette_game_params'
import type { RouletteResult } from '../entities/roulette_result'

export interface PlayRouletteGameRepository {
  playRouletteGame(param: PlayRouletteGameParam): Promise<RouletteResult | Failure>
}