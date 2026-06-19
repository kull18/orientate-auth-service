export class BusinessException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    // Asegurar que la instancia herede de la clase de excepción correctamente
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UserAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(`El usuario con el correo electrónico '${email}' ya se encuentra registrado.`, 409);
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('El correo electrónico o la contraseña son incorrectos.', 401);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'No autorizado.') {
    super(message, 401);
  }
}

export class NotFoundException extends BusinessException {
  constructor(resource: string) {
    super(`El recurso '${resource}' no fue encontrado.`, 404);
  }
}
