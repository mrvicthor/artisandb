import { logger } from '@/lib/winston';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'ServerError';
  const message = err.message || 'Internal server error';
  const errors = err.errors;

  logger.error(`Error occurred: ${message}`, {
    statusCode,
    code,
    errors,
  });

  next(err);

  res.status(statusCode).json({
    code,
    message,
    errors,
  });
};

export default errorHandler;
