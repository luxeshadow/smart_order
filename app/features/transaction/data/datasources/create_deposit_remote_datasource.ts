import { DepositModel } from '../models/deposit_model'
import { DatabaseException } from '@/core/errors/exception'

export class DepositRemoteDatasource {
  constructor(private supabase: any) {}

  async deposit(deposit: DepositModel): Promise<DepositModel> {
    const { data, error } = await this.supabase
      .from('deposits')
      .insert(deposit.toSupabase())
      .select()
      .single()

    if (error) throw new DatabaseException(error.message)

    return DepositModel.fromSupabase(data)
  }
}