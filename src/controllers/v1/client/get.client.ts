import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { UserModel } from '@/models/user.model';
import type { Response, NextFunction } from 'express';

export const getClientProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user; // Assuming user is set by your auth middleware
    if (!user || user.user_type !== 'client') {
      res.status(403).json({
        code: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    const existingUser = await UserModel.findById(user.id);
    if (!existingUser) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }
    res.status(200).json({
      id: existingUser.id,
      firstName: existingUser.first_name,
      lastName: existingUser.last_name,
      email: existingUser.email,
      phone: existingUser.phone,
      user_type: existingUser.user_type,
      email_verified: existingUser.email_verified,
    });
  } catch (error) {
    next(error);
  }
};
