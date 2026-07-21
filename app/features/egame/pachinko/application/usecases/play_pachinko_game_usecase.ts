import type { UseCase } from '@/core/usecase/usecase'
import { DatabaseFailure, type Failure } from '@/core/errors/failure'
import type { PachinkoResult } from '../../domain/entities/pachinko_result'
import type { PlayPachinkoGameRepository } from '../../domain/repository/play_pachinko_game_repository'
import type { PlayPachinkoGameParam } from '../params/play_pachinko_game_params'
import { PlayPachinkoGameValidator } from '../../presentation/validators/play_pachinko_game_validator'

export class PlayPachinkoGameUseCase implements UseCase<PachinkoResult, PlayPachinkoGameParam> {
  constructor(private readonly repository: PlayPachinkoGameRepository) {}

  async execute(param: PlayPachinkoGameParam): Promise<PachinkoResult | Failure> {
    const validationError = PlayPachinkoGameValidator.validate(param)
    if (validationError) return new DatabaseFailure(validationError)

    return this.repository.playPachinkoGame(param)
  }
}
