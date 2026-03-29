import { RegisterRepositoryImpl } from '../../../app/features/auth//data/repositories/register_repository_impl'
import { AuthFailure, DatabaseFailure } from '../../../app/core/errors/failure'
import type { RegisterParam } from '../../../app/features/auth/application/params/register_params'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const param: RegisterParam = {
    userName: body.username,
    phoneNumber: body.phone,
    password: body.password,
    role : body.role
  }

  const repo = new RegisterRepositoryImpl()

  const result = await repo.register(param)

  if (result instanceof AuthFailure) {
    throw createError({
      statusCode: 401,
      statusMessage: result.message
    })
  }

  if (result instanceof DatabaseFailure) {
    throw createError({
      statusCode: 500,
      statusMessage: result.message
    })
  }

  return {
    success: true,
    data: result
  }
})