import express from 'express';
import helmet from 'helmet';
import authRoutes from './infrastructure/adapters/inputs/http/routes/authRoutes';
import { errorHandler } from './core/middlewares/errorHandler';
import { corsMiddleware } from './core/middlewares/corsMiddleware';

const app = express();

// Desactivar cabecera X-Powered-By por seguridad
app.disable('x-powered-by');

// Registrar Helmet para inyectar cabeceras de seguridad
app.use(helmet());

// Configurar CORS mediante middleware independiente
app.use(corsMiddleware);

// Middleware para parsear cuerpos JSON
app.use(express.json());

// Endpoint de verificación de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'orientate-auth-service',
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas bajo el prefijo api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Middleware global para el manejo de excepciones
app.use(errorHandler);

export default app;
