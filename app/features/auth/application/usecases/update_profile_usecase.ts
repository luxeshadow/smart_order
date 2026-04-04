import type { UseCase } from '@/core/usecase/usecase'
import type { UpdateProfileRepository } from '../../domain/repository/update_profile_repository'
import type { UpdateProfileParam } from '../params/update_profile_params'
import { Failure, AuthFailure } from '@/core/errors/failure'
import { UpdateProfileValidator } from '../../presentation/validators/update_profile_validator'

/**
 * UseCase pour la mise à jour des informations de profil utilisateur.
 * Utilise uniquement le repository dédié aux profils.
 */
export class UpdateProfileUseCase implements UseCase<void, UpdateProfileParam> {
  private repository: UpdateProfileRepository

  constructor(repository: UpdateProfileRepository) {
    this.repository = repository
  }

  async execute(param: UpdateProfileParam): Promise<void | Failure> {
    // 1. Validation des données via le Validator spécifique
    const validationError = UpdateProfileValidator.validate(param)

    if (validationError) {
      return new AuthFailure(validationError)
    }

    // 2. Appel au repository dédié à la mise à jour de profil
    // On passe le paramètre validé au RepositoryImpl
    return await this.repository.updateProfile(param)
  }
}