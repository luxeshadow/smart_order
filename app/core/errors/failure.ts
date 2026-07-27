export abstract class Failure {
  message: string
  type: string

  constructor(message: string, type: string) {
    this.message = message
    this.type = type
  }

  static isFailure(obj: any): obj is Failure {
    return obj instanceof Failure
  }
}

export class AuthFailure extends Failure {
  constructor(message: string) {
    super(message, 'AUTH_FAILURE')
  }
}

export class UserAlreadyExistsFailure extends Failure {
  constructor(message: string) {
    super(message, 'USER_ALREADY_EXISTS')
  }
}

export class ValidatorFailure extends Failure {
  constructor(message: string) {
    super(message, 'VALIDATOR_FAILURE')
  }
}

export class DatabaseFailure extends Failure {
  constructor(message: string) {
    super(message, 'DATABASE_FAILURE')
  }
}

export class ServerFailure extends Failure {
  constructor(message: string) {
    super(message, 'SERVER_FAILURE')
  }
}

export class ActiveLevelRequiredFailure extends Failure {
  constructor(message: string = "Vous devez avoir au moins un niveau actif pour pouvoir jouer.") {
    super(message, 'ACTIVE_LEVEL_REQUIRED')
  }
}

export class UserUnconfirmedFailure extends Failure {
  constructor(
    public email: string, 
    message = "Un compte existe déjà avec cet e-mail mais n'a pas encore été activé."
  ) {
    super(message, 'USER_UNCONFIRMED')
  }
}