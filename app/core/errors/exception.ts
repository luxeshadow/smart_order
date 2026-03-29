export class AppException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppException'
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