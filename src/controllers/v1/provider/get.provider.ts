import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { UserModel } from '@/models/user.model';
import type { Response, NextFunction } from 'express';

export const getProviderProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user; // Assuming user is set by your auth middleware
    if (!user || user.user_type !== 'provider') {
      res.status(403).json({
        code: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }
    const provider = await UserModel.findById(user.id);

    if (!provider) {
      next({
        status: 404,
        code: 'ProviderNotFound',
        message: 'Provider profile not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Provider profile retrieved successfully',
      provider: {
        id: provider.id,
        firstName: provider.first_name,
        lastName: provider.last_name,
        email: provider.email,
        phone: provider.phone,
        user_type: provider.user_type,
        email_verified: provider.email_verified,
      },
    });
  } catch (error) {
    next(error);
  }
};
