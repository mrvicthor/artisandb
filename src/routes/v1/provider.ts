import { getProviderProfile } from '@/controllers/v1/provider/get.provider';
import authenticate from '@/middleware/authMiddleware';
// import authorizeRole from '@/middleware/authorizeRole';
import { Router } from 'express';

const router = Router();

router.get('/provider-only', authenticate, getProviderProfile);
export default router;
