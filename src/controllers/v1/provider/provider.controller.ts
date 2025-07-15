import { AuthenticatedRequest } from '@/middleware/authMiddleware';
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

    // Fetch provider profile logic here
    // For example, you might fetch from a database
    const providerProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      // Add other provider-specific fields as needed
    };

    res.status(200).json(providerProfile);
  } catch (error) {
    next(error);
  }
};
