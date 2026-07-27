export class AppException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppException'
  }
}

export class ActiveLevelRequiredException extends Error {
  constructor(message = "Vous devez avoir au moins un niveau actif pour jouer.") {
    super(message)
    this.name = 'ActiveLevelRequiredException'
  }
}

export class AuthException extends AppException {
  constructor(message = 'Authentication error') {
    super(message)
  }
}

export class UserAlreadyExistsException extends AppException {
  constructor(message ='Un utilisateur existe déjà avec ce numéro') {
    super(message)
  }
}

export class DatabaseException extends AppException {
  constructor(message = 'Database error') {
    super(message)
  }
}


export class ServerException extends AppException {
  constructor(message = 'Server error') {
    super(message)
  }

}
export class UserUnconfirmedException extends Error {
  constructor(public email: string) {
    super("Un compte existe déjà avec cet e-mail mais n'a pas encore été activé.")
    this.name = 'UserUnconfirmedException'
  }
}