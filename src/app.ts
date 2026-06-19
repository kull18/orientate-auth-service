import express from 'express';
import authRoutes from './infrastructure/adapters/inputs/http/routes/authRoutes';
import { errorHandler } from './core/middlewares/errorHandler';

const app = express();

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
