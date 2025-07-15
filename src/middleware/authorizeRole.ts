import type { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to authorize user roles.
 * @param {string[]} roles - Array of roles to authorize.
 * @returns {Function} Middleware function.
 */

const authorizeRole =
  (roles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.includes(user.user_type)) {
      res.status(403).json({
        code: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }
    next();
  };

export default authorizeRole;
