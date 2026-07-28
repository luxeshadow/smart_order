import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException, UserAlreadyExistsException, UserUnconfirmedException } from '@/core/errors/exception'
import type { RegisterPayload } from '../../application/params/register_params'

export class RegisterRemoteDatasource {
  constructor(private supabase: any) { }

  async register(param: RegisterPayload): Promise<UserModel> {
    const emailClean = param.email.trim().toLowerCase()

    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: emailClean,
      password: param.password
    })

    if (authError) {
      const isAlreadyRegistered = authError.message
        .toLowerCase()
        .includes('already registered') || authError.message.toLowerCase().includes('already exists')

      if (isAlreadyRegistered) {
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email: emailClean
        })

        if (resendError) {
          throw new UserAlreadyExistsException('Un compte actif existe déjà avec cette adresse e-mail.')
        }

        throw new UserUnconfirmedException(emailClean)
      }

      throw new AuthException(authError.message)
    }

    const user = authData?.user
    if (!user) {
      throw new AuthException("Erreur lors de la création de l'identifiant.")
    }

    const isEmailConfirmed = !!user.email_confirmed_at
    const hasEmptyIdentities = user.identities && user.identities.length === 0

    if (isEmailConfirmed) {
      throw new UserAlreadyExistsException('Un compte actif existe déjà avec cette adresse e-mail.')
    }

    if (hasEmptyIdentities || !isEmailConfirmed) {

      await this.supabase.auth.resend({
        type: 'signup',
        email: emailClean
      })

      throw new UserUnconfirmedException(emailClean)
    }

    const userId = user.id

    const { data: phoneUser, error: phoneCheckError } = await this.supabase
      .from('users')
      .select('id')
      .eq('phone_number', param.phoneNumber)
      .neq('id', userId)
      .maybeSingle()

    if (phoneCheckError) {
      throw new DatabaseException(phoneCheckError.message)
    }

    if (phoneUser) {
      throw new UserAlreadyExistsException('Ce numéro de téléphone est déjà utilisé par un autre compte.')
    }
    const userModel = new UserModel({
      id: userId,
      username: param.userName,
      email: emailClean,
      phoneNumber: param.phoneNumber,
      role: param.role,
      referredBy: param.referredBy
    })

    const { data, error: upsertError } = await this.supabase
      .from('users')
      .upsert(userModel.toSupabase(), { onConflict: 'id' })
      .select()
      .single()

    if (upsertError || !data) {
      throw new DatabaseException(
        upsertError?.message || 'Erreur lors de la création du profil utilisateur.'
      )
    }

    return UserModel.fromSupabase(data)
  }
}