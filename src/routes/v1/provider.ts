import { getProviderProfile } from '@/controllers/v1/provider/provider.controller';
import authenticate from '@/middleware/authMiddleware';
import authorizeRole from '@/middleware/authorizeRole';
import { Router } from 'express';

const router = Router();

router.get(
  '/provider-only',
  authenticate,
  authorizeRole(['provider']),
  getProviderProfile,
);
export default router;
