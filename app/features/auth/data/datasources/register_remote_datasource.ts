import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException, UserAlreadyExistsException, UserUnconfirmedException } from '@/core/errors/exception'
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

    // 2. Gestion des erreurs d'authentification directes
    if (authError) {
      const isAlreadyRegistered = authError.message
        .toLowerCase()
        .includes('already registered') || authError.message.toLowerCase().includes('already exists')

      if (isAlreadyRegistered) {
        // Envoi/Renvoi de l'OTP
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email: emailClean
        })

        if (resendError) {
          throw new UserAlreadyExistsException(
            'Un compte actif existe déjà avec cette adresse e-mail.'
          )
        }

        throw new UserUnconfirmedException(emailClean)
      }

      throw new AuthException(authError.message)
    }

    // 3. Cas des identités vides (Compte déjà existant non confirmé dans Supabase Auth)
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

    // 4. VERIFICATION EN BDD : Est-ce que le profil utilisateur existe DÉJÀ par ID ou par Email ?
    const { data: existingProfile, error: profileCheckError } = await this.supabase
      .from('users')
      .select('id, phone_number, email')
      .or(`id.eq.${userId},email.eq.${emailClean}`)
      .maybeSingle()

    if (profileCheckError) {
      throw new DatabaseException(profileCheckError.message)
    }

    // Si le profil existe déjà en BDD, c'est que l'utilisateur avait déjà tenté de s'inscrire sans valider son OTP !
    if (existingProfile) {
      // Renvoi du code OTP
      await this.supabase.auth.resend({
        type: 'signup',
        email: emailClean
      })

      throw new UserUnconfirmedException(emailClean)
    }

    // 5. Vérification séparée pour le numéro de téléphone (s'il appartient à un AUTRE compte)
    const { data: phoneUser, error: phoneCheckError } = await this.supabase
      .from('users')
      .select('id')
      .eq('phone_number', param.phoneNumber)
      .maybeSingle()

    if (phoneCheckError) {
      throw new DatabaseException(phoneCheckError.message)
    }

    if (phoneUser) {
      throw new UserAlreadyExistsException(
        'Ce numéro de téléphone est déjà utilisé.'
      )
    }
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
      if (insertError?.code === '23505' || insertError?.message?.includes('duplicate key')) {
        await this.supabase.auth.resend({
          type: 'signup',
          email: emailClean
        })
        throw new UserUnconfirmedException(emailClean)
      }

      throw new DatabaseException(
        insertError?.message ||
        'Erreur lors de la création du profil utilisateur.'
      )
    }

    return UserModel.fromSupabase(data)
  }
}