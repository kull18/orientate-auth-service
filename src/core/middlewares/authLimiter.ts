import rateLimit from 'express-rate-limit';

/**
 * Limitador de tasa de peticiones para proteger endpoints críticos
 * de ataques de fuerza bruta y denegación de servicio (DoS).
 * 
 * Permite un máximo de 5 peticiones por cada 15 minutos por dirección IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos en milisegundos
  max: 100, // Límite de 100 peticiones por IP por ventana
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Demasiados intentos desde esta dirección IP. Por favor, inténtelo de nuevo más tarde.',
  },
  standardHeaders: true, // Retorna info de límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Desactiva las cabeceras `X-RateLimit-*` obsoletas
});
