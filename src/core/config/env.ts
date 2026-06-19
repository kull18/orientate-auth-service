import dotenv from 'dotenv';

// Cargar archivo .env
dotenv.config();

export interface EnvVariables {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const getEnv = (): EnvVariables => {
  const getRequired = (name: string): string => {
    const val = process.env[name];
    if (!val) {
      throw new Error(`Variable de entorno requerida faltante: ${name}`);
    }
    return val;
  };

  const getOptional = (name: string, fallback: string): string => {
    return process.env[name] || fallback;
  };

  const portStr = getOptional('PORT', '3000');
  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    throw new Error(`PORT debe ser un número válido, se obtuvo: ${portStr}`);
  }

  const dbPortStr = getOptional('DB_PORT', '5432');
  const dbPort = parseInt(dbPortStr, 10);
  if (isNaN(dbPort)) {
    throw new Error(`DB_PORT debe ser un número válido, se obtuvo: ${dbPortStr}`);
  }

  return {
    PORT: port,
    DB_HOST: getOptional('DB_HOST', 'localhost'),
    DB_PORT: dbPort,
    DB_USER: getOptional('DB_USER', 'postgres'),
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: getOptional('DB_NAME', 'orientate_auth'),
    JWT_SECRET: getRequired('JWT_SECRET'),
    JWT_EXPIRES_IN: getOptional('JWT_EXPIRES_IN', '1d'),
  };
};

export const env = getEnv();
