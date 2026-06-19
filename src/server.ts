import app from './app';
import { env } from './core/config/env';
import { pgPool } from './core/database/pgPool';

const startServer = async () => {
  try {
    // Probar conexión a la base de datos antes de arrancar
    const client = await pgPool.connect();
    console.log('Pool de conexiones de PostgreSQL inicializado correctamente.');
    client.release();

    // Iniciar escucha del servidor HTTP
    app.listen(env.PORT, () => {
      console.log(`[Oriéntate+ Auth Service] Microservicio iniciado con éxito en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Capturar señales de terminación para cerrar el pool de base de datos de forma limpia
const gracefulShutdown = async () => {
  console.log('Cerrando pool de conexiones de base de datos...');
  await pgPool.end();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
