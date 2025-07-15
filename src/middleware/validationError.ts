import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

const validationError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next({
      status: 400,
      code: 'ValidationError',
      message: 'Invalid input data',
      errors: errors.mapped(),
    });
  }
  next();
};

export default validationError;
