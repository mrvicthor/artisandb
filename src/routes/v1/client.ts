import { Router } from 'express';
import { completeClientProfile } from '@/lib/profile';
import authenticate from '@/middleware/authMiddleware';
import authorizeRole from '@/middleware/authorizeRole';
import { getClientProfile } from '@/controllers/v1/client/client.controller';

const router = Router();
router.get(
  '/client-only',
  authenticate,
  authorizeRole(['client']),
  getClientProfile,
);
router.post(
  '/profile',
  authenticate,
  authorizeRole(['client']),
  completeClientProfile,
);

export default router;
