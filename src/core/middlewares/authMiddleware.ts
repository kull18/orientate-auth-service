import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { UnauthorizedException } from '../../domain/exceptions/BusinessException';

// Extender la interfaz Request de Express de forma global
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedException('Cabecera de autorización faltante o con formato inválido (debe ser Bearer).'));
  }

  const token = authHeader.split(' ')[1];
  
  // Usar el servicio de tokens resuelto del contenedor
  const payload = container.tokenService.verifyToken(token);
  if (!payload) {
    return next(new UnauthorizedException('Token de acceso inválido o expirado.'));
  }

  req.user = payload;
  next();
};
