
import type { DepositParam } from '../../application/params/deposit_params'
import { Failure } from '@/core/errors/failure'
import type { Deposit } from '../entities/deposit'

export interface DepositRepository {

  deposit(param: DepositParam): Promise<Deposit | Failure>
}