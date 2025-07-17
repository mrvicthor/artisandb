import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { UserModel } from '@/models/user.model';
import type { Response, NextFunction } from 'express';

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user; // Assuming user is set by your auth middleware
    if (!user || user.user_type !== 'admin') {
      res.status(403).json({
        code: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }
    const userId = req.params.id;
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }
    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
