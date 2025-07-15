import { logger } from '@/lib/winston';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { Token } from '@/models/token.model';

import type { Response, NextFunction } from 'express';

const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    if (refreshToken) {
      await Token.deleteOne(refreshToken);
      logger.info('User logged out successfully', {
        userId: req.user?.id,
        token: refreshToken,
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    return next(error);
  }
};

export default logout;
