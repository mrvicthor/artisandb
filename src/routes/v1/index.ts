import { Router } from 'express';
import authRoutes from '@/routes/v1/auth';
import usersRoutes from '@/routes/v1/users';
import clientRoutes from '@/routes/v1/client';
import providerRoutes from '@/routes/v1/provider';
const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'Ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/users', clientRoutes);
router.use('/users', providerRoutes);

export default router;
