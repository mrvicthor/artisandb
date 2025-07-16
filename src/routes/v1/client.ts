import { Router } from 'express';
import { completeClientProfile } from '@/lib/profile';
import authenticate from '@/middleware/authMiddleware';
import authorizeRole from '@/middleware/authorizeRole';
import { getClientProfile } from '@/controllers/v1/client/get.client';

const router = Router();
router.get(
  '/client',
  authenticate,
  authorizeRole(['client']),
  getClientProfile,
);
router.put(
  '/client/profile',
  authenticate,
  authorizeRole(['client']),
  completeClientProfile,
);

export default router;
