import jwt from 'jsonwebtoken';
import config from '@/config';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/winston';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    user_type: string;
  };
}

const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ code: 'Unauthorized', message: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    req.user = decoded as AuthenticatedRequest['user'];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ code: 'Unauthorized', message: 'Invalid token' });
  }
};

export default authenticate;
