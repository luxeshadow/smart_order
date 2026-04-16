import type { Failure } from '@/core/errors/failure'
import type { ListMyTransactionParam } from '../../application/params/list_my_transaction_params'
import type { MyTransaction } from '../entities/my_transaction'

export interface ListMyTransactionRepository {
   listMyTransaction(param: ListMyTransactionParam): Promise <MyTransaction[]|Failure>
}