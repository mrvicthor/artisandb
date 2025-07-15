import { Router } from 'express';
import authRoutes from '@/routes/v1/auth';
import clientRoutes from '@/routes/v1/client';
import providerRoutes from '@/routes/v1/provider';
import { getProviderProfile } from '@/controllers/v1/provider/provider.controller';
const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'Ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/client', clientRoutes);
router.use('/provider', providerRoutes);

export default router;
