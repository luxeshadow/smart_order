// import { supabase } from '../supabase/client'
import { UserModel } from '../models/user_model'
import { AuthException, DatabaseException,UserAlreadyExistsException } from '@/core/errors/exception'
import type { RegisterParam } from '../../application/params/register_params'

export class RegisterRemoteDatasource {

  async register(param: RegisterParam): Promise<UserModel> {

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', param.phoneNumber)
      .maybeSingle()
    if (existingUser) {
      throw new UserAlreadyExistsException()
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${param.phoneNumber}@app.com`,
      password: param.password
    })

    if (authError || !authData.user) {
      throw new AuthException()
    }

    const userId = authData.user.id

    const userModel = new UserModel({
      id: userId,
      username: param.userName,
      phoneNumber: param.phoneNumber,
      role: param.role,
    })

    const { data, error } = await supabase
      .from('users')
      .insert(userModel.toSupabase())
      .select()
      .single()

    if (error || !data) {
      throw new DatabaseException();
    }

    return UserModel.fromSupabase(data)
  }
}