import { ValidationError } from '@/validation/userValidation';
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'ServerError';
  let message = err.message || 'Internal server error';
  let errors = err.errors;

  res.status(statusCode).json({
    code,
    message,
    errors,
  });
};

export default errorHandler;
