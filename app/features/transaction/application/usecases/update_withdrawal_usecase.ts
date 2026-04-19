
import type { UseCase } from '@/core/usecase/usecase'
import type { UpdateWithdrawalRepository } from '../../domain/repository/update_withdrawal_repository'
import type { UpdateWithdrawalParam } from '../params/update_withdrawal_params'
import { Failure } from '@/core/errors/failure'

export class UpdateWithdrawalUseCase
  implements UseCase<void, UpdateWithdrawalParam>
{
  constructor(private repository: UpdateWithdrawalRepository) {}

  async execute(param: UpdateWithdrawalParam): Promise<void | Failure> {
    return await this.repository.updateWithdrawal(param)
  }
}