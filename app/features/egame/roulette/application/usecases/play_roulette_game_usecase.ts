// features/transaction/application/usecases/play_roulette_game_usecase.ts
import type { UseCase } from '@/core/usecase/usecase'
import type { PlayRouletteGameRepository } from '../../domain/repository/play_roulette_game_repository'
import type { PlayRouletteGameParam } from '../params/play_roulette_game_params'
import type { RouletteResult } from '../../domain/entities/roulette_result' // Importation de ton interface d'entité
import { Failure, DatabaseFailure } from '@/core/errors/failure'
import { PlayRouletteGameValidator } from '../../presentation/validators/play_roulette_game_validator'

// Remplacement de void par RouletteResult ici
export class PlayRouletteGameUseCase implements UseCase<RouletteResult, PlayRouletteGameParam> {
  private repository: PlayRouletteGameRepository

  constructor(repository: PlayRouletteGameRepository) {
    this.repository = repository
  }

  // Remplacement de void par RouletteResult ici aussi
  async execute(param: PlayRouletteGameParam): Promise<RouletteResult | Failure> {
    // 1. Validation des paramètres d'entrée
    const validationError = PlayRouletteGameValidator.validate(param)

    if (validationError) {
      return new DatabaseFailure(validationError)
    }

    // 2. Exécution de l'action via le Repository
    const result = await this.repository.playRouletteGame(param)
    
    return result
  }
}