import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException, UserAlreadyExistsException, UserUnconfirmedException } from '@/core/errors/exception'
import type { RegisterPayload } from '../../application/params/register_params'

export class RegisterRemoteDatasource {
  constructor(private supabase: any) { }

  async register(param: RegisterPayload): Promise<UserModel> {
    const emailClean = param.email.trim().toLowerCase()

    // 1. Tentative d'inscription Auth dans Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: emailClean,
      password: param.password
    })

    // 2. Gestion des erreurs renvoyées directement par Supabase Auth (ex: utilisateur déjà enregistré)
    if (authError) {
      const isAlreadyRegistered = authError.message
        .toLowerCase()
        .includes('already registered') || authError.message.toLowerCase().includes('already exists')

      if (isAlreadyRegistered) {
        // Tente de renvoyer l'OTP
        const { error: resendError } = await this.supabase.auth.resend({
          type: 'signup',
          email: emailClean
        })

        // Si Supabase refuse le renvoi, c'est que l'email est DÉJÀ confirmé/actif
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

    // 3. VÉRIFICATION DE LA CONFIRMATION DE L'EMAIL DANS SUPABASE AUTH
    // (a) Identités vides = Utilisateur déjà existant dans Auth
    // (b) user.email_confirmed_at !== null = L'utilisateur a déjà confirmé son email
    const isEmailConfirmed = !!user.email_confirmed_at
    const hasEmptyIdentities = user.identities && user.identities.length === 0

    if (isEmailConfirmed) {
      throw new UserAlreadyExistsException('Un compte actif existe déjà avec cette adresse e-mail.')
    }

    if (hasEmptyIdentities || !isEmailConfirmed) {
      // L'e-mail n'est pas encore confirmé -> On renvoie l'OTP et on redirige vers l'écran d'OTP
      await this.supabase.auth.resend({
        type: 'signup',
        email: emailClean
      })

      throw new UserUnconfirmedException(emailClean)
    }

    const userId = user.id

    // 4. Vérification si le téléphone est utilisé par un AUTRE utilisateur
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

    // 5. Création ou mise à jour (UPSERT) du profil utilisateur
    // On utilise upsert() au lieu d'insert() au cas où la ligne 'users' a déjà été créée lors de la 1ère tentative
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