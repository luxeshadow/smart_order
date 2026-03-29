export abstract class Failure {
  message: string

  constructor(message: string) {
    this.message = message
  }
}

export class AuthFailure extends Failure {}

export class UserAlreadyExistsFailure extends Failure {}

export class DatabaseFailure extends Failure {}

export class ServerFailure extends Failure {}