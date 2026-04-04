import { DatabaseException } from '@/core/errors/exception'
import { DepositModel } from '../models/deposit_model'
import type { DepositParam } from '../../application/params/deposit_params'

export class DepositRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async deposit(param: DepositParam): Promise<DepositModel> {
    try {
      const insertData = {
        user_id: param.userId,
        deposit_phone_number: param.depositPhoneNumber,
        amount: param.amount,
        method: param.method,
        status: 'pending',
        reference_id: param.referenceId || null
      }

      const { data, error } = await this.supabase
        .from('deposits')
        .insert([insertData])
        .select() 
        .single()

      if (error) {
        throw new DatabaseException(this.translateError(error.message))
      }

      if (!data) {
        throw new DatabaseException("Aucune donnée retournée après l'insertion.")
      }

      return DepositModel.fromSupabase(data)

    } catch (error: any) {
      if (error instanceof DatabaseException) throw error
      throw new DatabaseException(error.message || "Erreur lors de la communication avec le serveur.")
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Erreur lors de la transaction."
    if (message.includes("violates check constraint")) return "Le montant doit être supérieur à 0."
    if (message.includes("violates foreign key constraint")) return "Utilisateur non reconnu."
    return message
  }
}