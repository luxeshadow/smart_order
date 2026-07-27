import type { Failure } from '@/core/errors/failure'
import type { PlayPachinkoGameParam } from '../../application/params/play_pachinko_game_params'
import type { PachinkoResult } from '../entities/pachinko_result'

export interface PlayPachinkoGameRepository {
  checkUserActiveLevel(userId: string): Promise<boolean | Failure>
  playPachinkoGame(param: PlayPachinkoGameParam): Promise<PachinkoResult | Failure>
}