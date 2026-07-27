import type { Failure } from '@/core/errors/failure'
import type { PlayRouletteGameParam } from '../../application/params/play_roulette_game_params'
import type { RouletteResult } from '../entities/roulette_result'

export interface PlayRouletteGameRepository {
  checkUserActiveLevel(userId: string): Promise<boolean | Failure>
  playRouletteGame(param: PlayRouletteGameParam): Promise<RouletteResult | Failure>
}