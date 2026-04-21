import type { UserSearchParams } from '../../application/params/user_search_params'
import type { Failure } from '@/core/errors/failure'
import type { UserDetail } from '../entities/user_detail'

export interface UserDetailRepository {

  getUsersDetail(params: UserSearchParams): Promise<UserDetail[] | Failure>
}