import { Router } from 'express';
import authenticate from '@/middleware/authMiddleware';
import authorizeRole from '@/middleware/authorizeRole';
import { getClientProfile } from '@/controllers/v1/client/get.client';
import createClient from '@/controllers/v1/client/create.client';
import updateClient from '@/controllers/v1/client/update.client';

const router = Router();
router.get(
  '/client',
  authenticate,
  authorizeRole(['client']),
  getClientProfile,
);
router.post(
  '/create-client',
  authenticate,
  authorizeRole(['client']),
  createClient,
);

router.put(
  '/update-client/:id',
  authenticate,
  authorizeRole(['client']),
  updateClient,
);

export default router;
