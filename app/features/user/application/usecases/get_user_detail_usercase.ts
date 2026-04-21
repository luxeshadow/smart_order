import type { UseCase } from '@/core/usecase/usecase'
import type { UserDetailRepository } from '../../domain/repository/user_detail_repository'
import type { UserSearchParams } from '../params/user_search_params'
import type { UserDetail } from '../../domain/entities/user_detail'
import { Failure, AuthFailure } from '@/core/errors/failure'

export class GetUsersDetailUseCase implements UseCase<UserDetail[], UserSearchParams> {
  private repository: UserDetailRepository

  constructor(repository: UserDetailRepository) {
    this.repository = repository
  }

  async execute(params: UserSearchParams): Promise<UserDetail[] | Failure> {

    if (params.query && params.query.trim().length === 1) {
      return new AuthFailure("Veuillez saisir au moins 2 caractères pour la recherche.")
    }
    const result = await this.repository.getUsersDetail(params)
    return result
  }
}