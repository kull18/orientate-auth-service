import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173']; // Localhost frontend default ports

/**
 * Middleware para configurar CORS (Cross-Origin Resource Sharing)
 * permitiendo solicitudes únicamente de los orígenes de confianza.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles, curl, etc.)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      return allowed.trim().toLowerCase() === origin.trim().toLowerCase();
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política de CORS de Oriéntate+'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Authorization', 'x-auth-token'],
  credentials: true,
});
