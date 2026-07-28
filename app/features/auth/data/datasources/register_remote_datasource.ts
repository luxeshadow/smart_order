import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException, UserAlreadyExistsException, UserUnconfirmedException } from '@/core/errors/exception'
import type { RegisterPayload } from '../../application/params/register_params'

export class RegisterRemoteDatasource {
  constructor(private supabase: any) { }

  async register(param: RegisterPayload): Promise<UserModel> {
    const emailClean = param.email.trim().toLowerCase()

    // 1. Vérifier si le numéro de téléphone est déjà pris dans public.users
    const { data: phoneUser, error: phoneCheckError } = await this.supabase
      .from('users')
      .select('id')
      .eq('phone_number', param.phoneNumber)
      .maybeSingle()

    if (phoneCheckError) {
      throw new DatabaseException(phoneCheckError.message)
    }

    if (phoneUser) {
      throw new UserAlreadyExistsException('Ce numéro de téléphone est déjà utilisé par un autre compte.')
    }

    // 2. Inscription dans Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: emailClean,
      password: param.password
    })

    if (authError) {
      const isAlreadyRegistered = authError.message.toLowerCase().includes('already registered') || 
                                  authError.message.toLowerCase().includes('already exists')

      if (isAlreadyRegistered) {
        throw new UserAlreadyExistsException('Un compte existe déjà avec cette adresse e-mail.')
      }

      throw new AuthException(authError.message)
    }

    const user = authData?.user
    if (!user) {
      throw new AuthException("Erreur lors de la création du compte.")
    }

    // 3. Insérer le profil dans public.users D'ABORD
    const userModel = new UserModel({
      id: user.id,
      username: param.userName,
      email: emailClean,
      phoneNumber: param.phoneNumber,
      role: param.role,
      referredBy: param.referredBy
    })

    const { data: userData, error: upsertError } = await this.supabase
      .from('users')
      .upsert(userModel.toSupabase(), { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (upsertError) {
      throw new DatabaseException(
        upsertError.message || 'Erreur lors de la création du profil utilisateur dans la base de données.'
      )
    }

    // 4. MAINTENANT, si l'email nécessite confirmation, on informe l'application
    const isEmailConfirmed = !!user.email_confirmed_at
    if (!isEmailConfirmed) {
      throw new UserUnconfirmedException(emailClean)
    }

    return UserModel.fromSupabase(userData)
  }
}