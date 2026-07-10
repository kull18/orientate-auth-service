const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'regiber123',
  database: process.env.DB_NAME || 'orientate_auth'
});

async function run() {
  console.log('Starting migration on local database:', pool.options.database);
  try {
    const query = `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS claimed_cct VARCHAR(10);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rfc VARCHAR(12);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS university_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';
    `;
    await pool.query(query);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
