import { Request, Response } from 'express';

const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
) => {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'ServerError';
  const message = err.message || 'Internal server error';
  const errors = err.errors;

  res.status(statusCode).json({
    code,
    message,
    errors,
  });
};

export default errorHandler;
