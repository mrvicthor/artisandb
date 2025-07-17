import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { UserModel } from '@/models/user.model';
import type { Response, NextFunction } from 'express';

export const getUsers = async (
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
    // Fetch all users from the UserModel
    const users = await UserModel.getUsers();
    console.log('Retrieved users:', users);
    if (!users || users.length === 0) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Users not found',
      });
      return;
    }
    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    next(error);
  }
};
