import express from 'express';
import config from '@/config';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import limiter from './lib/express_rate_limit';
import pool from './lib/db-connection';
import { logger } from './lib/winston';
import v1Routes from '@/routes/v1';
import { createAllTables } from './lib/query';
import errorHandler from './middleware/errorHandler';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS?.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable JSON request body parsing
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // only compress responses larger than 1KB
  }),
);

// Use Helmet to enhance security by setting various HTTP Headers
app.use(helmet());

// Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

(async () => {
  try {
    await pool.connect();
    await createAllTables();
    app.use('/api/v1', v1Routes);
    app.use(errorHandler);
    app.listen(config.PORT, () => {
      logger.info(`Server running at: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    logger.info('Server SHUTDOWN');
    await pool.end();
    logger.info('✅ Database pool closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown', error);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
