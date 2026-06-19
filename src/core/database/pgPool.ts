import { Pool } from 'pg';
import { env } from '../config/env';

export const pgPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20, // cantidad máxima de clientes en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Capturar errores inesperados en conexiones inactivas del pool
pgPool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});
