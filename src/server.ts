import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './core/config/env';
import { pgPool } from './core/database/pgPool';
import { initSocketIo } from './infrastructure/adapters/inputs/ws/SocketIoAdapter';

let server: http.Server;

const startServer = async () => {
  try {
    // Probar conexión a la base de datos antes de arrancar
    const client = await pgPool.connect();
    console.log('Pool de conexiones de PostgreSQL inicializado correctamente.');
    client.release();

    server = http.createServer(app);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];

    // Inicializar WebSocket
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });
    initSocketIo(io);

    // Iniciar escucha del servidor HTTP y WebSocket
    server.listen(env.PORT, () => {
      console.log(`[Oriéntate+ Auth Service] Servidor HTTP y WebSocket corriendo en puerto ${env.PORT}`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Capturar señales de terminación para cerrar el pool de base de datos de forma limpia
const gracefulShutdown = async () => {
  console.log('Cerrando pool de conexiones de base de datos y servidor...');
  if (server) {
    server.close();
  }
  await pgPool.end();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

