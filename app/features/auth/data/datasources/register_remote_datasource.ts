import { UserModel } from '../models/user_model'
import {AuthException,DatabaseException,UserAlreadyExistsException} from '@/core/errors/exception'
import type { RegisterPayload } from '../../application/params/register_params'

export class RegisterRemoteDatasource {
  constructor(private supabase: any) {}

  async register(param: RegisterPayload): Promise<UserModel> {
    const { data: existingUser, error: checkError } = await this.supabase
      .from('users')
      .select('id')
      .eq('phone_number', param.phoneNumber)
      .maybeSingle()

    if (checkError) {
      throw new DatabaseException(checkError.message)
    }

    if (existingUser) {
      throw new UserAlreadyExistsException(
        'Ce numéro de téléphone est déjà utilisé.'
      )
    }

    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email: param.email,
        password: param.password
      })

    if (authError || !authData.user) {
      throw new AuthException(
        authError?.message || "Erreur lors de la création de l'identifiant."
      )
    }

    const userId = authData.user.id

    const userModel = new UserModel({
      id: userId,
      username: param.userName,
      email: param.email,
      phoneNumber: param.phoneNumber,
      role: param.role
    })

    const { data, error: insertError } = await this.supabase
      .from('users')
      .insert(userModel.toSupabase())
      .select()
      .single()

    if (insertError || !data) {
      throw new DatabaseException(
        insertError?.message ||
          'Erreur lors de la création du profil utilisateur.'
      )
    }

    return UserModel.fromSupabase(data)
  }
}