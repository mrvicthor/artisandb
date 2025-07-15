import { UserValidator, ValidationError } from '@/validation/userValidation';
import { Response, Request, NextFunction } from 'express';

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.body = UserValidator.validateCreateUser(req.body);
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }
    next(error);
  }
};

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.body = UserValidator.validateUpdateUser(req.body);
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }
    next(error);
  }
};
