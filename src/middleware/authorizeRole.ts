import type { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { UserModel } from '@/models/user.model';
import { logger } from '@/lib/winston';

/**
 * Middleware to authorize user roles.
 * @param {string[]} roles - Array of roles to authorize.
 * @returns {Function} Middleware function.
 */

const authorizeRole =
  (roles: string[]) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user || !roles.includes(user.user_type)) {
        res.status(403).json({
          code: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
        return;
      }
      const foundUser = await UserModel.findById(user?.id as string);

      if (!foundUser) {
        res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error authorizing user role', error);
      return next({
        status: 500,
        code: 'InternalServerError',
        message: 'An error occurred while authorizing the user role',
      });
    }
  };

export default authorizeRole;
