import { DatabaseException } from '@/core/errors/exception'

/**
 * Vérifie simplement si l'utilisateur possède un niveau actif en BDD.
 * Renvoie `true` s'il en a un, `false` sinon.
 */
export const checkUserActiveLevel = async (supabase: any, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users_levels')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new DatabaseException(error.message)
    }

    // Renvoie true si un enregistrement existe, false sinon
    return !!data

  } catch (err: any) {
    if (err instanceof DatabaseException) {
      throw err
    }
    throw new DatabaseException(err.message || "Erreur lors de la vérification du niveau.")
  }
}