import dotenv from 'dotenv';
import ms from 'ms';
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: process.env.WHITELIST_ORIGINS,
  PGUSER: process.env.PGUSER || 'blackbear',
  PGHOST: process.env.PGHOST || 'localhost',
  PGDATABASE: process.env.PGDATABASE || 'artisandb',
  PGPORT: Number(process.env.PGPORT) || 5432,
  PGPASSWORD: process.env.PGPASSWORD,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY:
    (process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue) || '1h',
  REFRESH_TOKEN_EXPIRY:
    (process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue) || '30d',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

export default config;
