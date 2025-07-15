import { AuthenticatedRequest } from '@/middleware/authMiddleware';
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

    // Fetch client profile logic here
    // For example, you might fetch from a database
    const clientProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      // Add other client-specific fields as needed
    };

    res.status(200).json(clientProfile);
  } catch (error) {
    next(error);
  }
};
