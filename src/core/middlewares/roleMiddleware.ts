import { Request, Response, NextFunction } from 'express';
import { BusinessException, UnauthorizedException } from '../../domain/exceptions/BusinessException';

/**
 * Middleware para restringir acceso a rutas según el rol del usuario autenticado.
 * Debe colocarse después de authMiddleware.
 * 
 * @param allowedRoles Lista de nombres de rol permitidos (ej. ['admin', 'orientador'])
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException('Usuario no autenticado. Cabecera de autorización faltante.'));
    }

    const userRole = req.user.role.toLowerCase();
    
    // Validar si el rol del usuario está dentro de los permitidos
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);
    
    if (!isAllowed) {
      return next(new BusinessException('No tienes permisos suficientes para realizar esta acción.', 403));
    }

    next();
  };
};
