import pg from 'pg';
import config from '@/config';
import { logger } from './winston';

const { Pool } = pg;

const pool = new Pool({
  user: config.PGUSER,
  host: config.PGHOST,
  database: config.PGDATABASE,
  password: config.PGPASSWORD,
  port: config.PGPORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  query_timeout: 60000,
  statement_timeout: 60000,
});

pool.on('connect', (client) => {
  logger.info('✅ New client connected to database');

  client.query("SET application_name = 'artisan_services_app'");
});

pool.on('acquire', (client) => {
  logger.info('🔄 Client acquired from pool');
});

pool.on('error', (err, client) => {
  logger.error('❌ Unexpected error on idle client:', err);

  logger.error('Error details:', {
    message: err.message,
  });
});

pool.on('remove', (client) => {
  logger.info('🗑️ Client removed from pool');
});

export default pool;
