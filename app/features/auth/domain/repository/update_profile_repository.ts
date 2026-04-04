import type { Failure } from '@/core/errors/failure'
import type { UpdateProfileParam } from '../../application/params/update_profile_params'

export interface UpdateProfileRepository {

  updateProfile(param: UpdateProfileParam): Promise<void | Failure>
}