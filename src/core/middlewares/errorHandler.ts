import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof BusinessException) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // Capturar errores imprevistos
  console.error('Error no controlado:', err);

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Ocurrió un error interno en el servidor.',
  });
};
