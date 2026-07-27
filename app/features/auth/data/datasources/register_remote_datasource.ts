import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException, UserAlreadyExistsException,UserUnconfirmedException } from '@/core/errors/exception'
import type { RegisterPayload } from '../../application/params/register_params'

export class RegisterRemoteDatasource {
  constructor(private supabase: any) { }

  async register(param: RegisterPayload): Promise<UserModel> {
    const emailClean = param.email.trim().toLowerCase()

    // 1. Inscription Auth dans Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: emailClean,
      password: param.password
    })

    // 2. Gestion de l'erreur "User already registered"
    if (authError) {
      const isAlreadyRegistered = authError.message
        .toLowerCase()
        .includes('already registered') || authError.message.toLowerCase().includes('already exists')

      if (isAlreadyRegistered) {
        // L'utilisateur existe déjà dans Supabase Auth.
        // On déclenche le renvoi de l'OTP
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email: emailClean
        })

        if (resendError) {
          // Si le renvoi échoue parce qu'il a DÉJÀ confirmé son email,
          // Supabase Auth renvoie une erreur -> Le compte est donc ACTIF.
          throw new UserAlreadyExistsException(
            'Un compte actif existe déjà avec cette adresse e-mail.'
          )
        }

        throw new UserUnconfirmedException(emailClean)
      }

      throw new AuthException(authError.message)
    }

    // 3. Cas où l'utilisateur existe déjà dans Auth mais réessaie de s'inscrire (Identités multiples Supabase)
    if (authData?.user && authData.user.identities && authData.user.identities.length === 0) {
      await this.supabase.auth.resend({
        type: 'signup',
        email: emailClean
      })

      throw new UserUnconfirmedException(emailClean)
    }

    if (!authData?.user) {
      throw new AuthException("Erreur lors de la création de l'identifiant.")
    }

    const userId = authData.user.id

    // 4. Vérification si le profil existe déjà dans la table 'users'
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

    // 5. Insertion du profil dans la BDD
    const userModel = new UserModel({
      id: userId,
      username: param.userName,
      email: emailClean,
      phoneNumber: param.phoneNumber,
      role: param.role,
      referredBy: param.referredBy
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