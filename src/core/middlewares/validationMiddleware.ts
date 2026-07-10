import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../../domain/exceptions/BusinessException';

const GENERAL_UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTEGER_REGEXP = /^\d+$/;

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name, password, roleName, role, privacyAccepted } = req.body;
  const finalRoleName = roleName || role;

  if (!email || typeof email !== 'string' || !EMAIL_REGEXP.test(email.trim())) {
    return next(new BusinessException('El correo electrónico no es válido.', 400));
  }
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new BusinessException('El nombre debe tener al menos 2 caracteres.', 400));
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new BusinessException('La contraseña debe tener al menos 6 caracteres.', 400));
  }
  if (!finalRoleName || typeof finalRoleName !== 'string') {
    return next(new BusinessException('El rol es requerido.', 400));
  }
  if (privacyAccepted !== true && privacyAccepted !== 'true') {
    return next(new BusinessException('Debe aceptar el aviso de privacidad para poder registrarse.', 400));
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEXP.test(email.trim())) {
    return next(new BusinessException('El formato de correo electrónico no es válido.', 400));
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return next(new BusinessException('La contraseña es requerida.', 400));
  }

  next();
};

export const validateRecoverPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEXP.test(email.trim())) {
    return next(new BusinessException('El formato de correo electrónico no es válido.', 400));
  }

  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { token, newPassword } = req.body;

  if (!token || typeof token !== 'string' || !GENERAL_UUID_REGEXP.test(token)) {
    return next(new BusinessException('El token de restablecimiento no es válido.', 400));
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return next(new BusinessException('La nueva contraseña debe tener al menos 6 caracteres.', 400));
  }

  next();
};

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name } = req.body;

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEXP.test(email.trim())) {
      return next(new BusinessException('El formato de correo electrónico no es válido.', 400));
    }
  }
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return next(new BusinessException('El nombre debe tener al menos 2 caracteres.', 400));
    }
  }

  next();
};

export const validateUserRoleUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = req.params;
  const { roleName } = req.body;

  if (!userId || !GENERAL_UUID_REGEXP.test(userId)) {
    return next(new BusinessException('El ID de usuario no es válido (debe ser un UUID).', 400));
  }
  if (!roleName || typeof roleName !== 'string' || roleName.trim() === '') {
    return next(new BusinessException('El nombre de rol es requerido y debe ser un texto.', 400));
  }

  next();
};

export const validateChatHistory = (req: Request, res: Response, next: NextFunction): void => {
  const { partnerId } = req.params;
  const { limit, offset } = req.query;

  if (!partnerId || !GENERAL_UUID_REGEXP.test(partnerId)) {
    return next(new BusinessException('El ID del destinatario no es válido (debe ser un UUID).', 400));
  }

  if (limit !== undefined) {
    const limitStr = limit as string;
    if (!INTEGER_REGEXP.test(limitStr) || parseInt(limitStr, 10) < 0) {
      return next(new BusinessException('El parámetro "limit" debe ser un número entero positivo.', 400));
    }
  }

  if (offset !== undefined) {
    const offsetStr = offset as string;
    if (!INTEGER_REGEXP.test(offsetStr) || parseInt(offsetStr, 10) < 0) {
      return next(new BusinessException('El parámetro "offset" debe ser un número entero no negativo.', 400));
    }
  }

  next();
};
