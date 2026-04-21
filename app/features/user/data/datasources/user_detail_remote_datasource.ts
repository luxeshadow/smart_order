import { DatabaseException } from '@/core/errors/exception'
import { UserDetailModel } from '../models/user_detail_model'
import type { UserSearchParams } from '../../application/params/user_search_params'

export class UserDetailRemoteDatasource {
  constructor(private supabase: any) {}

  async fetchUsers(params: UserSearchParams): Promise<UserDetailModel[]> {
    try {
      let query = this.supabase.from('user_details_view').select('*')

      if (params.query) {
        query = query.or(`username.ilike.%${params.query}%,email.ilike.%${params.query}%`)
      }
      
      if (params.role) {
        query = query.eq('role', params.role)
      }

      const { data, error } = await query.order('username', { ascending: true })

      if (error) throw new DatabaseException(error.message)
      
      return (data || []).map((u: any) => UserDetailModel.fromSupabase(u))
    } catch (error: any) {
      throw new DatabaseException(error.message)
    }
  }
}