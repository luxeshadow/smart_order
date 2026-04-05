import { DatabaseException } from '@/core/errors/exception'
import type { AssignLevelParam } from '../../application/params/assign_level_params'



  export class AssignLevelRemoteDatasource {
  constructor(private supabase: any) {}

  async assignLevel(param: AssignLevelParam): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('activate_level_and_withdraw', {
        p_user_id: param.userId,
        p_level_id: param.levelId,
      });

      if (error) throw new DatabaseException(error.message);

      return data as number; 
    } catch (error: any) {
      if (error instanceof DatabaseException) throw error;
      throw new DatabaseException(error.message || "Erreur serveur");
    }
  }
}
