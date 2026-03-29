import { RegisterRemoteDatasource } from '../datasources/register_remote_datasource'
import {AuthException,DatabaseException,UserAlreadyExistsException} from '@/core/errors/exception'
import {AuthFailure,DatabaseFailure} from '@/core/errors/failure'
import type { RegisterRepository } from '../../domain/repository/register_repository'
import type { User } from '../../domain/entities/user'
import type { RegisterParam } from '../../application/params/register_params'

export class RegisterRepositoryImpl implements RegisterRepository {

  private datasource = new RegisterRemoteDatasource()

  async register(param: RegisterParam): Promise<User | AuthFailure | DatabaseFailure> {

    try {
      const user = await this.datasource.register(param)
      return user

    } catch (error: any) {

      if (error instanceof UserAlreadyExistsException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof AuthException) {
        return new AuthFailure(error.message)
      }

      if (error instanceof DatabaseException) {
        return new DatabaseFailure(error.message)
      }

      return new DatabaseFailure('Unknown error')
    }
  }
}