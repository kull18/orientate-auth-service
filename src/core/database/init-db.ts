import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'regiber123',
};

const dbName = process.env.DB_NAME || 'orientate_auth';
const sqlFilePath = path.join(__dirname, 'init.sql');

async function run(): Promise<void> {
  console.log('Iniciando configuración de la base de datos...');
  console.log(`Conectando al servidor PostgreSQL en ${dbConfig.host}:${dbConfig.port} como usuario ${dbConfig.user}...`);

  // 1. Conectarse a la base de datos por defecto 'postgres' para verificar/crear la base de datos destino
  const clientDefault = new Client({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    await clientDefault.connect();
    console.log('Conexión inicial exitosa.');

    // Verificar si la base de datos existe
    const res = await clientDefault.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      console.log(`La base de datos "${dbName}" no existe. Creándola...`);
      // CREATE DATABASE no se puede ejecutar en una transacción o con parámetros en algunas versiones, lo ejecutamos directamente
      await clientDefault.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos "${dbName}" creada con éxito.`);
    } else {
      console.log(`La base de datos "${dbName}" ya existe.`);
    }
  } catch (error: any) {
    console.error('Error al verificar/crear la base de datos:', error.message);
    process.exit(1);
  } finally {
    await clientDefault.end();
  }

  // 2. Conectarse a la base de datos destino para ejecutar el script de inicialización
  const clientTarget = new Client({
    ...dbConfig,
    database: dbName,
  });

  try {
    console.log(`Conectando a la base de datos "${dbName}"...`);
    await clientTarget.connect();
    console.log(`Conexión a "${dbName}" establecida.`);

    console.log(`Leyendo el archivo SQL: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Ejecutando script de inicialización SQL...');
    await clientTarget.query(sql);
    console.log('Script de la base de datos ejecutado e inicializado correctamente.');
  } catch (error) {
    console.error('Error al ejecutar el script de inicialización:', error);
    process.exit(1);
  } finally {
    await clientTarget.end();
  }
}

run();
