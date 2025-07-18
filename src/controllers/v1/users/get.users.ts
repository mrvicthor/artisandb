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

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    // Fetch all users from the UserModel
    const users = await UserModel.getUsers(limit, offset);

    if (!users || users.length === 0) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Users not found',
      });
      return;
    }
    const totalUsers = await UserModel.countUsers();
    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      total: totalUsers,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    next(error);
  }
};
