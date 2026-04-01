import { AuthException, DatabaseException } from '@/core/errors/exception'
import { UserModel } from '../models/user_model'
import type { LoginParam } from '../../application/params/login_params'

export class LoginRemoteDatasource {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  async login(param: LoginParam): Promise<UserModel> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: param.email,
        password: param.password,
      });

      // On vérifie la présence du user ET de la session pour le token
      if (authError || !authData.user || !authData.session) {
        throw new AuthException(this.translateError(authError?.message));
      }

      // On récupère le token JWT
      const token = authData.session.access_token;

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        throw new DatabaseException("Impossible de récupérer le profil utilisateur.");
      }

      return UserModel.fromSupabase(userData, token);

    } catch (error: any) {
      if (error instanceof AuthException || error instanceof DatabaseException) throw error;
      throw new DatabaseException(error.message || "Erreur de connexion au serveur.");
    }
  }

  private translateError(message?: string): string {
    if (!message) return "Identifiants invalides.";
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
    if (message.includes("Email not confirmed")) return "Veuillez confirmer votre email avant de vous connecter.";
    return message;
  }
}